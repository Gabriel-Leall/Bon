//! Shared types and validation functions for the Tauri application.

use regex::Regex;
use serde::{Deserialize, Serialize};
use specta::Type;
use std::sync::LazyLock;

/// Default shortcut for the quick pane
pub const DEFAULT_QUICK_PANE_SHORTCUT: &str = "CommandOrControl+Shift+.";

/// Default visual preferences.
pub const DEFAULT_THEME: &str = "system";
pub const DEFAULT_ACCENT: &str = "blue";
pub const DEFAULT_DAILY_WRAP_UP_REMINDER_TIME: &str = "18:00";

/// Maximum size for recovery data files (10MB)
pub const MAX_RECOVERY_DATA_BYTES: u32 = 10_485_760;

/// Pre-compiled regex pattern for filename validation.
/// Only allows alphanumeric characters, dashes, underscores, and a single extension.
pub static FILENAME_PATTERN: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9]+)?$")
        .expect("Failed to compile filename regex pattern")
});

// ============================================================================
// Preferences
// ============================================================================

/// Application preferences that persist to disk.
/// Only contains settings that should be saved between sessions.
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct AppPreferences {
    #[serde(default = "default_theme")]
    pub theme: String,
    #[serde(default = "default_accent")]
    pub accent: String,
    /// Global shortcut for quick pane (e.g., "CommandOrControl+Shift+.")
    /// If None, uses the default shortcut
    pub quick_pane_shortcut: Option<String>,
    /// User's preferred language (e.g., "en", "es", "de")
    /// If None, uses system locale detection
    pub language: Option<String>,
    /// Whether to minimize the application to the system tray instead of exiting
    pub minimize_to_tray: Option<bool>,
    /// The start day of the week (e.g., "monday", "sunday")
    pub start_of_week: Option<String>,
    /// The time when daily habits and stats reset (e.g., "00:00", "03:00")
    pub daily_reset_time: Option<String>,
    /// How strongly the dashboard should adapt to the current context
    pub adaptive_dashboard_mode: Option<String>,
    /// Absolute path to the active local notes vault. If None, uses Documents/Axis Notes.
    pub notes_vault_path: Option<String>,
    /// Whether Axis should send a safety reminder to wrap up the current day.
    #[serde(default)]
    pub daily_wrap_up_reminder_enabled: bool,
    /// Local time for the daily wrap-up reminder (HH:MM).
    #[serde(default = "default_daily_wrap_up_reminder_time")]
    pub daily_wrap_up_reminder_time: String,
}

impl Default for AppPreferences {
    fn default() -> Self {
        Self {
            theme: default_theme(),
            accent: default_accent(),
            quick_pane_shortcut: None, // None means use default
            language: None,            // None means use system locale
            minimize_to_tray: Some(false),
            start_of_week: Some("monday".to_string()),
            daily_reset_time: Some("00:00".to_string()),
            adaptive_dashboard_mode: Some("full".to_string()),
            notes_vault_path: None,
            daily_wrap_up_reminder_enabled: false,
            daily_wrap_up_reminder_time: default_daily_wrap_up_reminder_time(),
        }
    }
}

fn default_theme() -> String {
    DEFAULT_THEME.to_string()
}

fn default_accent() -> String {
    DEFAULT_ACCENT.to_string()
}

fn default_daily_wrap_up_reminder_time() -> String {
    DEFAULT_DAILY_WRAP_UP_REMINDER_TIME.to_string()
}

impl AppPreferences {
    /// Normalizes persisted appearance values from older or malformed files.
    /// Returns true when the in-memory preferences were migrated.
    pub fn normalize_appearance(&mut self) -> bool {
        let normalized_theme = normalize_theme(&self.theme);
        let normalized_accent = normalize_accent(&self.accent);
        let changed = self.theme != normalized_theme || self.accent != normalized_accent;

        self.theme = normalized_theme;
        self.accent = normalized_accent;

        changed
    }

    /// Normalizes malformed reminder preferences without preventing startup.
    /// Returns true when the persisted reminder time was replaced.
    pub fn normalize_reminders(&mut self) -> bool {
        if validate_time_of_day(&self.daily_wrap_up_reminder_time).is_ok() {
            return false;
        }

        self.daily_wrap_up_reminder_time = default_daily_wrap_up_reminder_time();
        true
    }
}

// ============================================================================
// Recovery Errors
// ============================================================================

/// Error types for recovery operations (typed for frontend matching)
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(tag = "type")]
pub enum RecoveryError {
    /// File does not exist (expected case, not a failure)
    FileNotFound,
    /// Filename validation failed
    ValidationError { message: String },
    /// Data exceeds size limit
    DataTooLarge { max_bytes: u32 },
    /// File system read/write error
    IoError { message: String },
    /// JSON serialization/deserialization error
    ParseError { message: String },
}

impl std::fmt::Display for RecoveryError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RecoveryError::FileNotFound => write!(f, "File not found"),
            RecoveryError::ValidationError { message } => write!(f, "Validation error: {message}"),
            RecoveryError::DataTooLarge { max_bytes } => {
                write!(f, "Data too large (max {max_bytes} bytes)")
            }
            RecoveryError::IoError { message } => write!(f, "IO error: {message}"),
            RecoveryError::ParseError { message } => write!(f, "Parse error: {message}"),
        }
    }
}

// ============================================================================
// Validation Functions
// ============================================================================

/// Validates a filename for safe file system operations.
/// Only allows alphanumeric characters, dashes, underscores, and a single extension.
pub fn validate_filename(filename: &str) -> Result<(), String> {
    if filename.is_empty() {
        return Err("Filename cannot be empty".to_string());
    }

    if filename.chars().count() > 100 {
        return Err("Filename too long (max 100 characters)".to_string());
    }

    if !FILENAME_PATTERN.is_match(filename) {
        return Err(
            "Invalid filename: only alphanumeric characters, dashes, underscores, and dots allowed"
                .to_string(),
        );
    }

    Ok(())
}

/// Validates string input length (by character count, not bytes).
pub fn validate_string_input(input: &str, max_len: usize, field_name: &str) -> Result<(), String> {
    let char_count = input.chars().count();
    if char_count > max_len {
        return Err(format!("{field_name} too long (max {max_len} characters)"));
    }
    Ok(())
}

/// Normalizes current, legacy, and invalid theme values.
pub fn normalize_theme(theme: &str) -> String {
    match theme {
        "light" | "dark" | "cream" | "system" => theme.to_string(),
        "entardecer" => "dark".to_string(),
        _ => default_theme(),
    }
}

/// Normalizes current and invalid accent values.
pub fn normalize_accent(accent: &str) -> String {
    match accent {
        "blue" | "purple" | "red" => accent.to_string(),
        _ => default_accent(),
    }
}

/// Validates a normalized theme value.
pub fn validate_theme(theme: &str) -> Result<(), String> {
    match theme {
        "light" | "dark" | "cream" | "system" => Ok(()),
        _ => Err("Invalid theme: must be 'light', 'dark', 'cream', or 'system'".to_string()),
    }
}

/// Validates a normalized accent value.
pub fn validate_accent(accent: &str) -> Result<(), String> {
    match accent {
        "blue" | "purple" | "red" => Ok(()),
        _ => Err("Invalid accent: must be 'blue', 'purple', or 'red'".to_string()),
    }
}

/// Validates a local wall-clock time in 24-hour HH:MM format.
pub fn validate_time_of_day(value: &str) -> Result<(), String> {
    let Some((hour, minute)) = value.split_once(':') else {
        return Err("Invalid time: must use HH:MM".to_string());
    };

    if hour.len() != 2 || minute.len() != 2 {
        return Err("Invalid time: must use HH:MM".to_string());
    }

    let hour = hour
        .parse::<u8>()
        .map_err(|_| "Invalid hour in time".to_string())?;
    let minute = minute
        .parse::<u8>()
        .map_err(|_| "Invalid minute in time".to_string())?;

    if hour > 23 || minute > 59 {
        return Err("Invalid time: hour or minute is out of range".to_string());
    }

    Ok(())
}

/// Validates dashboard adaptation mode.
pub fn validate_dashboard_adaptation_mode(mode: &str) -> Result<(), String> {
    match mode {
        "full" | "reduced" | "off" => Ok(()),
        _ => Err(
            "Invalid dashboard adaptation mode: must be 'full', 'reduced', or 'off'".to_string(),
        ),
    }
}

#[cfg(test)]
mod appearance_tests {
    use super::*;

    #[test]
    fn preferences_default_to_system_and_blue() {
        let preferences = AppPreferences::default();

        assert_eq!(preferences.theme, DEFAULT_THEME);
        assert_eq!(preferences.accent, DEFAULT_ACCENT);
    }

    #[test]
    fn legacy_preferences_without_accent_deserialize_with_blue() {
        let preferences: AppPreferences = serde_json::from_str(r#"{"theme":"cream"}"#)
            .expect("legacy preferences should deserialize");

        assert_eq!(preferences.theme, "cream");
        assert_eq!(preferences.accent, DEFAULT_ACCENT);
        assert!(!preferences.daily_wrap_up_reminder_enabled);
        assert_eq!(
            preferences.daily_wrap_up_reminder_time,
            DEFAULT_DAILY_WRAP_UP_REMINDER_TIME
        );
    }

    #[test]
    fn normalizes_legacy_and_invalid_appearance_values() {
        let mut legacy = AppPreferences {
            theme: "entardecer".to_string(),
            accent: "".to_string(),
            ..AppPreferences::default()
        };

        assert!(legacy.normalize_appearance());
        assert_eq!(legacy.theme, "dark");
        assert_eq!(legacy.accent, DEFAULT_ACCENT);

        let mut invalid = AppPreferences {
            theme: "sepia".to_string(),
            accent: "green".to_string(),
            ..AppPreferences::default()
        };

        assert!(invalid.normalize_appearance());
        assert_eq!(invalid.theme, DEFAULT_THEME);
        assert_eq!(invalid.accent, DEFAULT_ACCENT);
    }

    #[test]
    fn validates_only_current_appearance_values() {
        for theme in ["light", "dark", "cream", "system"] {
            assert!(validate_theme(theme).is_ok());
        }
        assert!(validate_theme("entardecer").is_err());

        for accent in ["blue", "purple", "red"] {
            assert!(validate_accent(accent).is_ok());
        }
        assert!(validate_accent("green").is_err());
    }

    #[test]
    fn validates_and_normalizes_daily_wrap_up_times() {
        for value in ["00:00", "18:00", "23:59"] {
            assert!(validate_time_of_day(value).is_ok());
        }
        for value in ["8:00", "24:00", "18:60", "tomorrow"] {
            assert!(validate_time_of_day(value).is_err());
        }

        let mut preferences = AppPreferences {
            daily_wrap_up_reminder_time: "25:90".to_string(),
            ..AppPreferences::default()
        };

        assert!(preferences.normalize_reminders());
        assert_eq!(
            preferences.daily_wrap_up_reminder_time,
            DEFAULT_DAILY_WRAP_UP_REMINDER_TIME
        );
        assert!(!preferences.normalize_reminders());
    }
}
