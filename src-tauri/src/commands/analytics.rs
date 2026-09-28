use chrono::{Datelike, Duration, Local, NaiveDate};
use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};
use std::collections::HashSet;
use tauri::{command, State};

struct HabitStreakInput {
    id: String,
    name: String,
    frequency: String,
    frequency_days: Option<String>,
    completed_dates: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, specta::Type)]
pub struct HabitStreakSummary {
    pub habit_id: String,
    pub current_streak: i32,
    pub best_historical_streak: i32,
}

fn is_habit_scheduled(frequency: &str, custom_days: &HashSet<u32>, date: NaiveDate) -> bool {
    let weekday = date.weekday().num_days_from_sunday();
    match frequency {
        "daily" => true,
        "weekdays" => (1..=5).contains(&weekday),
        "weekends" => weekday == 0 || weekday == 6,
        "custom" => custom_days.contains(&weekday),
        _ => false,
    }
}

fn calculate_habit_streaks(
    completed_dates: &[String],
    frequency: &str,
    frequency_days: Option<&str>,
    today: NaiveDate,
) -> (i32, i32) {
    let completed: HashSet<NaiveDate> = completed_dates
        .iter()
        .filter_map(|date| NaiveDate::parse_from_str(date, "%Y-%m-%d").ok())
        .filter(|date| *date <= today)
        .collect();
    let Some(mut cursor) = completed.iter().min().copied() else {
        return (0, 0);
    };
    let custom_days: HashSet<u32> = frequency_days
        .and_then(|days| serde_json::from_str::<Vec<u32>>(days).ok())
        .unwrap_or_default()
        .into_iter()
        .filter(|day| *day <= 6)
        .collect();

    let mut streak = 0;
    let mut best_streak = 0;
    while cursor <= today {
        if is_habit_scheduled(frequency, &custom_days, cursor) {
            // An unfinished due date remains in progress until the day ends.
            if cursor == today && !completed.contains(&cursor) {
                cursor += Duration::days(1);
                continue;
            }
            if completed.contains(&cursor) {
                streak += 1;
                best_streak = best_streak.max(streak);
            } else {
                streak = 0;
            }
        }
        cursor += Duration::days(1);
    }
    (streak, best_streak)
}

async fn load_habit_streak_inputs(pool: &SqlitePool) -> Result<Vec<HabitStreakInput>, String> {
    let rows = sqlx::query(
        r#"
        SELECT h.id, h.name, h.frequency, h.frequency_days, hl.completed_date
        FROM habits h
        LEFT JOIN habit_logs hl ON hl.habit_id = h.id
        WHERE h.active = 1
        ORDER BY h.sort_order, h.id, hl.completed_date
        "#,
    )
    .fetch_all(pool)
    .await
    .map_err(|error| format!("Failed to query habit streaks: {error}"))?;

    let mut inputs: Vec<HabitStreakInput> = Vec::new();
    for row in rows {
        let habit_id: String = row.get("id");
        if inputs.last().map(|habit| habit.id.as_str()) != Some(habit_id.as_str()) {
            inputs.push(HabitStreakInput {
                id: habit_id,
                name: row.get("name"),
                frequency: row.get("frequency"),
                frequency_days: row.get("frequency_days"),
                completed_dates: Vec::new(),
            });
        }
        if let Some(completed_date) = row.get::<Option<String>, _>("completed_date") {
            if let Some(habit) = inputs.last_mut() {
                habit.completed_dates.push(completed_date);
            }
        }
    }

    Ok(inputs)
}

fn summarize_habit_streak_inputs(
    inputs: Vec<HabitStreakInput>,
    today: NaiveDate,
) -> Vec<(String, HabitStreakSummary)> {
    inputs
        .into_iter()
        .map(|habit| {
            let (current_streak, best_historical_streak) = calculate_habit_streaks(
                &habit.completed_dates,
                &habit.frequency,
                habit.frequency_days.as_deref(),
                today,
            );
            (
                habit.name,
                HabitStreakSummary {
                    habit_id: habit.id,
                    current_streak,
                    best_historical_streak,
                },
            )
        })
        .collect()
}

#[command]
#[specta::specta]
pub async fn get_habit_streak_summaries(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<HabitStreakSummary>, String> {
    let inputs = load_habit_streak_inputs(pool.inner()).await?;
    let today = Local::now().date_naive();

    Ok(summarize_habit_streak_inputs(inputs, today)
        .into_iter()
        .map(|(_, summary)| summary)
        .collect())
}

#[derive(Debug, Serialize, Deserialize, specta::Type)]
pub struct FocusTimeByDay {
    pub day: String,
    pub total_seconds: i32,
}

#[derive(Debug, Serialize, Deserialize, specta::Type)]
pub struct TaskCountByDay {
    pub day: String,
    pub created: i32,
    pub completed: i32,
}

#[derive(Debug, Serialize, Deserialize, specta::Type)]
pub struct PomodoroSummary {
    pub session_type: String, // "focus" | "short_break" | "long_break"
    pub sessions: i32,
    pub total_seconds: i32,
}

#[derive(Debug, Serialize, Deserialize, specta::Type)]
pub struct AnalyticsSummary {
    pub total_focus_seconds: i32,
    pub total_focus_seconds_prev: i32,
    pub tasks_created: i32,
    pub tasks_completed: i32,
    pub pomodoros_completed: i32,
    pub days_active: i32,
    pub top_productivity_day: Option<String>,
    pub best_habit_name: Option<String>,
    pub best_habit_streak: i32,
}

/// Fetches the summary numbers for the top dashboard cards.
#[command]
#[specta::specta]
pub async fn get_analytics_summary(
    pool: State<'_, SqlitePool>,
    start: String,
    end: String,
    prev_start: String,
    prev_end: String,
) -> Result<AnalyticsSummary, String> {
    let focus_curr = sqlx::query_scalar::<_, i64>(
        r#"
        SELECT COALESCE(SUM(duration_seconds), 0)
        FROM pomodoro_sessions
        WHERE session_type = 'focus'
          AND completed = 1
          AND started_at >= ?
          AND started_at < ?
        "#,
    )
    .bind(&start)
    .bind(&end)
    .fetch_one(&*pool)
    .await
    .unwrap_or(0) as i32;

    let focus_prev = sqlx::query_scalar::<_, i64>(
        r#"
        SELECT COALESCE(SUM(duration_seconds), 0)
        FROM pomodoro_sessions
        WHERE session_type = 'focus'
          AND completed = 1
          AND started_at >= ?
          AND started_at < ?
        "#,
    )
    .bind(&prev_start)
    .bind(&prev_end)
    .fetch_one(&*pool)
    .await
    .unwrap_or(0) as i32;

    let tasks_created = sqlx::query_scalar::<_, i64>(
        r#"
        SELECT COUNT(*)
        FROM tasks
        WHERE created_at >= ?
          AND created_at < ?
        "#,
    )
    .bind(&start)
    .bind(&end)
    .fetch_one(&*pool)
    .await
    .unwrap_or(0) as i32;

    let tasks_completed = sqlx::query_scalar::<_, i64>(
        r#"
        SELECT COUNT(*)
        FROM tasks
        WHERE completed_at IS NOT NULL
          AND completed_at >= ?
          AND completed_at < ?
        "#,
    )
    .bind(&start)
    .bind(&end)
    .fetch_one(&*pool)
    .await
    .unwrap_or(0) as i32;

    let pomodoros_completed = sqlx::query_scalar::<_, i64>(
        r#"
        SELECT COUNT(*)
        FROM pomodoro_sessions
        WHERE session_type = 'focus'
          AND completed = 1
          AND started_at >= ?
          AND started_at < ?
        "#,
    )
    .bind(&start)
    .bind(&end)
    .fetch_one(&*pool)
    .await
    .unwrap_or(0) as i32;

    let days_active = sqlx::query_scalar::<_, i64>(
        r#"
        SELECT COUNT(DISTINCT DATE(started_at))
        FROM pomodoro_sessions
        WHERE started_at >= ? AND started_at < ?
        "#,
    )
    .bind(&start)
    .bind(&end)
    .fetch_one(&*pool)
    .await
    .unwrap_or(0) as i32;

    let top_productivity_day = sqlx::query_scalar::<_, String>(
        r#"
        SELECT DATE(started_at) as day
        FROM pomodoro_sessions
        WHERE session_type = 'focus'
          AND completed = 1
          AND started_at >= ?
          AND started_at < ?
        GROUP BY day
        ORDER BY SUM(duration_seconds) DESC
        LIMIT 1
        "#,
    )
    .bind(&start)
    .bind(&end)
    .fetch_one(&*pool)
    .await
    .ok();

    // Calculate the best current habit streak using each habit's schedule.
    // Keep analytics resilient if habit data cannot be read.
    let streak_inputs = load_habit_streak_inputs(pool.inner())
        .await
        .unwrap_or_default();
    let today = Local::now().date_naive();
    let best_streak = summarize_habit_streak_inputs(streak_inputs, today)
        .into_iter()
        .filter(|(_, summary)| summary.current_streak > 0)
        .max_by_key(|(_, summary)| summary.current_streak);

    let (best_habit_name, best_habit_streak) = best_streak
        .map(|(name, summary)| (Some(name), summary.current_streak))
        .unwrap_or((None, 0));

    Ok(AnalyticsSummary {
        total_focus_seconds: focus_curr,
        total_focus_seconds_prev: focus_prev,
        tasks_created,
        tasks_completed,
        pomodoros_completed,
        days_active,
        top_productivity_day,
        best_habit_name,
        best_habit_streak,
    })
}

#[command]
#[specta::specta]
pub async fn get_focus_time_by_day(
    pool: State<'_, SqlitePool>,
    start: String,
    end: String,
) -> Result<Vec<FocusTimeByDay>, String> {
    let rows = sqlx::query(
        r#"
        SELECT
          DATE(started_at) as day,
          SUM(duration_seconds) as total_seconds
        FROM pomodoro_sessions
        WHERE session_type = 'focus'
          AND completed = 1
          AND started_at >= ?
          AND started_at < ?
        GROUP BY DATE(started_at)
        ORDER BY day
        "#,
    )
    .bind(&start)
    .bind(&end)
    .fetch_all(&*pool)
    .await
    .map_err(|e| format!("Failed to fetch focus time: {e}"))?;

    let result = rows
        .into_iter()
        .map(|row| FocusTimeByDay {
            day: row.get("day"),
            total_seconds: row.get::<i64, _>("total_seconds") as i32,
        })
        .collect();

    Ok(result)
}

#[command]
#[specta::specta]
pub async fn get_task_counts_by_day(
    pool: State<'_, SqlitePool>,
    start: String,
    end: String,
) -> Result<Vec<TaskCountByDay>, String> {
    // We do separate queries for created and completed, and then merge in Rust
    // to handle full outer join simply.
    let created_rows = sqlx::query(
        r#"
        SELECT DATE(created_at) as day, COUNT(*) as count
        FROM tasks
        WHERE created_at >= ? AND created_at < ?
        GROUP BY DATE(created_at)
        "#,
    )
    .bind(&start)
    .bind(&end)
    .fetch_all(&*pool)
    .await
    .map_err(|e| format!("Failed to fetch created tasks: {e}"))?;

    let completed_rows = sqlx::query(
        r#"
        SELECT DATE(completed_at) as day, COUNT(*) as count
        FROM tasks
        WHERE completed_at IS NOT NULL
          AND completed_at >= ? AND completed_at < ?
        GROUP BY DATE(completed_at)
        "#,
    )
    .bind(&start)
    .bind(&end)
    .fetch_all(&*pool)
    .await
    .map_err(|e| format!("Failed to fetch completed tasks: {e}"))?;

    use std::collections::BTreeMap;
    let mut day_map: BTreeMap<String, TaskCountByDay> = BTreeMap::new();

    for row in created_rows {
        let day: String = row.get("day");
        let created: i64 = row.get("count");
        day_map
            .entry(day.clone())
            .or_insert(TaskCountByDay {
                day,
                created: 0,
                completed: 0,
            })
            .created = created as i32;
    }

    for row in completed_rows {
        let day: String = row.get("day");
        let completed: i64 = row.get("count");
        day_map
            .entry(day.clone())
            .or_insert(TaskCountByDay {
                day,
                created: 0,
                completed: 0,
            })
            .completed = completed as i32;
    }

    Ok(day_map.into_values().collect())
}

#[command]
#[specta::specta]
pub async fn get_pomodoro_summary(
    pool: State<'_, SqlitePool>,
    start: String,
    end: String,
) -> Result<Vec<PomodoroSummary>, String> {
    let rows = sqlx::query(
        r#"
        SELECT
          session_type,
          COUNT(*) as sessions,
          SUM(duration_seconds) as total_seconds
        FROM pomodoro_sessions
        WHERE completed = 1
          AND started_at >= ?
          AND started_at < ?
        GROUP BY session_type
        "#,
    )
    .bind(&start)
    .bind(&end)
    .fetch_all(&*pool)
    .await
    .map_err(|e| format!("Failed to fetch pomodoro summary: {e}"))?;

    let result = rows
        .into_iter()
        .map(|row| PomodoroSummary {
            session_type: row.get("session_type"),
            sessions: row.get::<i64, _>("sessions") as i32,
            total_seconds: row.get::<i64, _>("total_seconds") as i32,
        })
        .collect();

    Ok(result)
}

#[cfg(test)]
mod tests {
    use super::calculate_habit_streaks;
    use chrono::{Datelike, Duration, NaiveDate};

    fn dates(values: &[&str]) -> Vec<String> {
        values.iter().map(|date| (*date).to_string()).collect()
    }

    fn weekday_logs_ending_on(end_date: NaiveDate, count: usize) -> Vec<String> {
        let mut cursor = end_date;
        let mut completed_dates = Vec::with_capacity(count);

        while completed_dates.len() < count {
            if (1..=5).contains(&cursor.weekday().num_days_from_sunday()) {
                completed_dates.push(cursor.format("%Y-%m-%d").to_string());
            }
            cursor -= Duration::days(1);
        }

        completed_dates.reverse();
        completed_dates
    }

    #[test]
    fn weekday_streak_ignores_weekend_and_counts_next_monday() {
        let weekday_logs = dates(&[
            "2026-06-01",
            "2026-06-02",
            "2026-06-03",
            "2026-06-04",
            "2026-06-05",
        ]);
        let sunday = NaiveDate::from_ymd_opt(2026, 6, 7).expect("valid date");
        let monday = NaiveDate::from_ymd_opt(2026, 6, 8).expect("valid date");

        assert_eq!(
            calculate_habit_streaks(&weekday_logs, "weekdays", None, sunday),
            (5, 5)
        );
        assert_eq!(
            calculate_habit_streaks(&weekday_logs, "weekdays", None, monday),
            (5, 5)
        );

        let monday_logs = dates(&[
            "2026-06-01",
            "2026-06-02",
            "2026-06-03",
            "2026-06-04",
            "2026-06-05",
            "2026-06-08",
        ]);
        assert_eq!(
            calculate_habit_streaks(&monday_logs, "weekdays", None, monday),
            (6, 6)
        );
    }

    #[test]
    fn weekday_streaks_count_more_than_thirty_scheduled_days_and_ignore_weekends() {
        let friday = NaiveDate::from_ymd_opt(2026, 6, 19).expect("valid date");
        let sunday = NaiveDate::from_ymd_opt(2026, 6, 21).expect("valid date");
        let logs = weekday_logs_ending_on(friday, 35);

        assert_eq!(
            calculate_habit_streaks(&logs, "weekdays", None, sunday),
            (35, 35)
        );
    }

    #[test]
    fn missed_scheduled_weekday_breaks_current_streak_and_preserves_best() {
        let logs = dates(&[
            "2026-06-01",
            "2026-06-02",
            "2026-06-03",
            "2026-06-04",
            "2026-06-05",
        ]);
        let tuesday = NaiveDate::from_ymd_opt(2026, 6, 9).expect("valid date");

        assert_eq!(
            calculate_habit_streaks(&logs, "weekdays", None, tuesday),
            (0, 5)
        );
    }

    #[test]
    fn missed_weekday_splits_historical_streaks_around_the_missing_due_day() {
        let friday = NaiveDate::from_ymd_opt(2026, 6, 19).expect("valid date");
        let sunday = NaiveDate::from_ymd_opt(2026, 6, 21).expect("valid date");
        let mut logs = weekday_logs_ending_on(friday, 35);
        logs.remove(logs.len() - 2);

        assert_eq!(
            calculate_habit_streaks(&logs, "weekdays", None, sunday),
            (1, 33)
        );
    }
}
