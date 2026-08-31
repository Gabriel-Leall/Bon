//! Secure credential commands backed by the operating system credential store.

use keyring::{Entry, Error as KeyringError};

const SERVICE_NAME: &str = "com.gabrielleall.axis-desktop";

fn validate_credential_key(key: &str) -> Result<(), String> {
    match key {
        "github_token"
        | "slack_token"
        | "google_token"
        | "google_refresh_token"
        | "github_oauth_state"
        | "slack_oauth_state"
        | "google_oauth_state"
        | "google_oauth_code_verifier" => Ok(()),
        _ => Err("Unsupported credential key".to_string()),
    }
}

fn credential_entry(key: &str) -> Result<Entry, String> {
    validate_credential_key(key)?;
    Entry::new(SERVICE_NAME, key)
        .map_err(|error| format!("Failed to initialize secure credential storage: {error}"))
}

#[tauri::command]
#[specta::specta]
pub async fn get_credential(key: String) -> Result<Option<String>, String> {
    let entry = credential_entry(&key)?;

    match entry.get_password() {
        Ok(value) => Ok(Some(value)),
        Err(KeyringError::NoEntry) => Ok(None),
        Err(error) => Err(format!("Failed to read secure credential: {error}")),
    }
}

#[tauri::command]
#[specta::specta]
pub async fn save_credential(key: String, value: String) -> Result<(), String> {
    let entry = credential_entry(&key)?;
    entry
        .set_password(&value)
        .map_err(|error| format!("Failed to save secure credential: {error}"))
}

#[tauri::command]
#[specta::specta]
pub async fn delete_credential(key: String) -> Result<(), String> {
    let entry = credential_entry(&key)?;

    match entry.delete_credential() {
        Ok(()) | Err(KeyringError::NoEntry) => Ok(()),
        Err(error) => Err(format!("Failed to delete secure credential: {error}")),
    }
}

#[cfg(test)]
mod tests {
    use super::validate_credential_key;

    #[test]
    fn accepts_only_known_oauth_credential_keys() {
        assert!(validate_credential_key("google_refresh_token").is_ok());
        assert!(validate_credential_key("arbitrary_key").is_err());
    }
}
