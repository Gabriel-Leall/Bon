import { beforeEach, describe, expect, it, vi } from 'vitest'
import { commands } from '@/lib/tauri-bindings'
import { getLocalISODate } from '@/lib/habits-domain'
import { selectHabitStats, useHabitsStore, type Habit } from './habits-store'

vi.mock('@/lib/tauri-bindings', () => ({
  commands: {
    getHabitStreakSummaries: vi.fn(),
    setHabitLogState: vi.fn(),
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

const habit: Habit = {
  id: 'habit-1',
  name: 'Walk',
  color: '#22c55e',
  frequency: 'weekdays',
  active: true,
  sort_order: 0,
  created_at: '2026-01-01T12:00:00.000Z',
  updated_at: '2026-01-01T12:00:00.000Z',
}

describe('habits-store streak summaries', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    useHabitsStore.setState({
      habits: [],
      todayLogs: [],
      monthLogs: [],
      streakSummaries: {},
      selectedHabitId: null,
      activeTab: 'today',
      isLoading: false,
      error: null,
    })
  })

  it('uses all-time server counts while keeping month statistics on the 30-day logs', async () => {
    vi.mocked(commands.getHabitStreakSummaries).mockResolvedValue({
      status: 'ok',
      data: [
        {
          habit_id: habit.id,
          current_streak: 37,
          best_historical_streak: 52,
        },
      ],
    })

    await useHabitsStore.getState().loadStreakSummaries()

    const recentLog = {
      id: 'recent-log',
      habit_id: habit.id,
      completed_date: getLocalISODate(),
      completed_at: new Date().toISOString(),
      state: 'done' as const,
    }
    const stats = selectHabitStats(
      [habit],
      [recentLog],
      30,
      getLocalISODate(),
      useHabitsStore.getState().streakSummaries
    )

    expect(stats.topCurrentHabit?.streak).toBe(37)
    expect(stats.bestHistoricalByHabit[0]?.streak).toBe(52)
    expect(stats.monthRate.completedDays).toBe(1)
    expect(stats.monthRate.totalDays).toBe(30)
  })

  it('reloads all-time counts after a habit log is saved or removed', async () => {
    const today = getLocalISODate()
    vi.mocked(commands.setHabitLogState).mockResolvedValue({
      status: 'ok',
      data: {
        id: 'today-log',
        habit_id: habit.id,
        completed_date: today,
        completed_at: new Date().toISOString(),
        state: 'done',
      },
    })
    vi.mocked(commands.getHabitStreakSummaries).mockResolvedValue({
      status: 'ok',
      data: [
        {
          habit_id: habit.id,
          current_streak: 38,
          best_historical_streak: 52,
        },
      ],
    })

    await useHabitsStore.getState().setHabitLogState(habit.id, 'done', today)

    expect(commands.getHabitStreakSummaries).toHaveBeenCalledOnce()
    expect(useHabitsStore.getState().streakSummaries[habit.id]).toEqual({
      currentStreak: 38,
      bestHistoricalStreak: 52,
    })
  })
})
