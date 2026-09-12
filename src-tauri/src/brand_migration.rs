//! One-time, non-destructive migration from the old application identifier.

use sqlx::{sqlite::SqliteConnectOptions, Connection, SqliteConnection};
use std::collections::HashSet;
use std::error::Error;
use std::fs;
use std::path::{Path, PathBuf};
use tauri::Manager;

const OLD_PRODUCTION_ID: &str = "com.gabrielleall.axis-desktop";
const OLD_DEVELOPMENT_ID: &str = "com.gabrielleall.axis-desktop.dev";
const NEW_PRODUCTION_ID: &str = "com.gabrielleall.bon";
const NEW_DEVELOPMENT_ID: &str = "com.gabrielleall.bon.dev";
const MIGRATION_MARKER: &str = ".bon-identity-migration-v1";

pub(crate) fn migrate_default_notes_vault(documents_dir: &Path) -> Result<(), Box<dyn Error>> {
    let source = documents_dir.join("Axis_Notes");
    let destination = documents_dir.join("Bon_Notes");
    if !source.exists() || destination.exists() {
        return Ok(());
    }

    let temporary = documents_dir.join(format!(".Bon_Notes.migrating-{}", uuid::Uuid::new_v4()));
    copy_missing(&source, &temporary, false)?;
    fs::rename(&temporary, &destination)?;
    log::info!("Copied the previous default notes vault into Bon_Notes");
    Ok(())
}

fn legacy_identifier(current_identifier: &str) -> Option<&'static str> {
    match current_identifier {
        NEW_PRODUCTION_ID => Some(OLD_PRODUCTION_ID),
        NEW_DEVELOPMENT_ID => Some(OLD_DEVELOPMENT_ID),
        _ => None,
    }
}

pub(crate) fn migrate_legacy_app_data(app: &tauri::App) -> Result<(), Box<dyn Error>> {
    let Some(old_identifier) = legacy_identifier(&app.config().identifier) else {
        return Ok(());
    };

    let new_data_dir = app.path().app_data_dir()?;
    if new_data_dir.join(MIGRATION_MARKER).exists() {
        return Ok(());
    }

    let mut visited = HashSet::new();
    for (base, destination) in [
        (app.path().data_dir()?, app.path().app_data_dir()?),
        (app.path().config_dir()?, app.path().app_config_dir()?),
    ] {
        let source = base.join(old_identifier);
        if !visited.insert(source.clone()) {
            continue;
        }

        copy_missing(&source, &destination, true)?;
        backup_sqlite(&source.join("tasks.db"), &destination.join("tasks.db"))?;
    }

    // WebView2 keeps localStorage in LocalAppData, separate from the app data
    // directory. Copy only persisted web storage, not hundreds of MB of cache.
    #[cfg(target_os = "windows")]
    {
        let source = app
            .path()
            .local_data_dir()?
            .join(old_identifier)
            .join("EBWebView")
            .join("Default")
            .join("Local Storage");
        let destination = app
            .path()
            .app_local_data_dir()?
            .join("EBWebView")
            .join("Default")
            .join("Local Storage");
        if !destination.exists() {
            copy_missing(&source, &destination, false)?;
        }
    }

    fs::create_dir_all(&new_data_dir)?;
    fs::write(new_data_dir.join(MIGRATION_MARKER), old_identifier)?;
    log::info!("Migrated previous application data into Bon without removing the original");
    Ok(())
}

fn copy_missing(
    source: &Path,
    destination: &Path,
    skip_tasks_db: bool,
) -> Result<(), Box<dyn Error>> {
    if !source.exists() {
        return Ok(());
    }
    if fs::symlink_metadata(source)?.file_type().is_symlink() {
        return Err(format!("Refusing to migrate symlinked source: {}", source.display()).into());
    }
    if destination.exists() && fs::symlink_metadata(destination)?.file_type().is_symlink() {
        return Err(format!(
            "Refusing to migrate into symlinked destination: {}",
            destination.display()
        )
        .into());
    }
    if !source.is_dir() || (destination.exists() && !destination.is_dir()) {
        return Err("Migration source and destination must be directories".into());
    }

    fs::create_dir_all(destination)?;
    for entry in fs::read_dir(source)? {
        let entry = entry?;
        let file_type = entry.file_type()?;
        if file_type.is_symlink() {
            continue;
        }
        let name = entry.file_name();
        if skip_tasks_db
            && matches!(
                name.to_str(),
                Some("tasks.db" | "tasks.db-wal" | "tasks.db-shm")
            )
        {
            continue;
        }

        let target = destination.join(name);
        if file_type.is_dir() {
            copy_missing(&entry.path(), &target, false)?;
        } else if file_type.is_file() && !target.exists() {
            fs::copy(entry.path(), target)?;
        }
    }
    Ok(())
}

fn backup_sqlite(source: &Path, destination: &Path) -> Result<(), Box<dyn Error>> {
    if !source.exists() || destination.exists() {
        return Ok(());
    }
    if fs::symlink_metadata(source)?.file_type().is_symlink() {
        return Err(format!(
            "Refusing to migrate symlinked database: {}",
            source.display()
        )
        .into());
    }
    fs::create_dir_all(
        destination
            .parent()
            .ok_or("Database has no parent directory")?,
    )?;

    // VACUUM INTO takes a consistent SQLite snapshot, including uncheckpointed
    // WAL records. A plain file copy could silently lose recent tasks.
    let temporary = PathBuf::from(format!(
        "{}.migrating-{}",
        destination.display(),
        uuid::Uuid::new_v4()
    ));
    let options = SqliteConnectOptions::new().filename(source).read_only(true);
    let result = tauri::async_runtime::block_on(async {
        let mut connection = SqliteConnection::connect_with(&options).await?;
        sqlx::query("VACUUM INTO ?")
            .bind(temporary.to_string_lossy().into_owned())
            .execute(&mut connection)
            .await?;
        connection.close().await
    });
    if let Err(error) = result {
        let _ = fs::remove_file(&temporary);
        return Err(error.into());
    }
    fs::rename(temporary, destination)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{
        backup_sqlite, copy_missing, legacy_identifier, migrate_default_notes_vault,
        OLD_DEVELOPMENT_ID, OLD_PRODUCTION_ID,
    };
    use sqlx::{sqlite::SqliteConnectOptions, Connection, SqliteConnection};
    use std::fs;

    #[test]
    fn maps_production_and_development_separately() {
        assert_eq!(
            legacy_identifier("com.gabrielleall.bon"),
            Some(OLD_PRODUCTION_ID)
        );
        assert_eq!(
            legacy_identifier("com.gabrielleall.bon.dev"),
            Some(OLD_DEVELOPMENT_ID)
        );
        assert_eq!(legacy_identifier("another.app"), None);
    }

    #[test]
    fn copies_data_without_overwriting_existing_bon_files() {
        let root = std::env::temp_dir().join(format!("bon-migration-{}", uuid::Uuid::new_v4()));
        let source = root.join("axis");
        let destination = root.join("bon");
        fs::create_dir_all(source.join("notes")).expect("create source");
        fs::create_dir_all(&destination).expect("create destination");
        fs::write(source.join("preferences.json"), "old").expect("write source preference");
        fs::write(destination.join("preferences.json"), "new")
            .expect("write destination preference");
        fs::write(source.join("notes").join("note.md"), "remember").expect("write note");
        fs::write(source.join("tasks.db"), "not-a-real-db").expect("write database placeholder");

        copy_missing(&source, &destination, true).expect("migrate files");

        assert_eq!(
            fs::read_to_string(destination.join("preferences.json")).expect("read preference"),
            "new"
        );
        assert_eq!(
            fs::read_to_string(destination.join("notes").join("note.md")).expect("read note"),
            "remember"
        );
        assert!(!destination.join("tasks.db").exists());
        fs::remove_dir_all(root).expect("remove test fixture");
    }

    #[test]
    fn sqlite_snapshot_includes_uncheckpointed_wal_data() {
        let root = std::env::temp_dir().join(format!("bon-db-migration-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&root).expect("create fixture directory");
        let source = root.join("old.db");
        let destination = root.join("new.db");
        let options = SqliteConnectOptions::new()
            .filename(&source)
            .create_if_missing(true);
        let mut connection =
            tauri::async_runtime::block_on(SqliteConnection::connect_with(&options))
                .expect("open source database");
        tauri::async_runtime::block_on(async {
            sqlx::query("PRAGMA journal_mode=WAL")
                .execute(&mut connection)
                .await
                .expect("enable WAL");
            sqlx::query("CREATE TABLE tasks (title TEXT NOT NULL)")
                .execute(&mut connection)
                .await
                .expect("create tasks");
            sqlx::query("INSERT INTO tasks (title) VALUES ('remember this')")
                .execute(&mut connection)
                .await
                .expect("insert task");
        });

        backup_sqlite(&source, &destination).expect("snapshot source database");

        let mut migrated = tauri::async_runtime::block_on(SqliteConnection::connect_with(
            &SqliteConnectOptions::new().filename(&destination),
        ))
        .expect("open migrated database");
        let title: String = tauri::async_runtime::block_on(async {
            sqlx::query_scalar("SELECT title FROM tasks LIMIT 1")
                .fetch_one(&mut migrated)
                .await
                .expect("read migrated task")
        });
        assert_eq!(title, "remember this");
        tauri::async_runtime::block_on(async {
            connection.close().await.expect("close source database");
            migrated.close().await.expect("close migrated database");
        });
        fs::remove_dir_all(root).expect("remove test fixture");
    }

    #[test]
    fn copies_default_notes_without_removing_or_merging_the_old_vault() {
        let documents = std::env::temp_dir().join(format!("bon-notes-{}", uuid::Uuid::new_v4()));
        let old_vault = documents.join("Axis_Notes");
        let new_vault = documents.join("Bon_Notes");
        fs::create_dir_all(old_vault.join("inbox")).expect("create legacy vault");
        fs::write(old_vault.join("inbox").join("note.md"), "important").expect("write legacy note");

        migrate_default_notes_vault(&documents).expect("copy legacy vault");

        assert_eq!(
            fs::read_to_string(new_vault.join("inbox").join("note.md")).expect("read copied note"),
            "important"
        );
        assert!(old_vault.join("inbox").join("note.md").exists());
        fs::remove_dir_all(documents).expect("remove test fixture");
    }
}
