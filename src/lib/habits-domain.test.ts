import {
  bestHistoricalStreak,
  calculateStreakFromDates,
  getRecoverableHabitDates,
} from '@/lib/habits-domain'

describe('habits-domain', () => {
  it('returns recent due dates without logs as recoverable', () => {
    expect(
      getRecoverableHabitDates('daily', null, ['2026-06-01'], '2026-06-02', 3)
    ).toEqual(['2026-05-31', '2026-05-30'])
  })

  it('skips days that are not due for weekday-only habits', () => {
    expect(
      getRecoverableHabitDates('weekdays', null, [], '2026-06-08', 3)
    ).toEqual(['2026-06-05'])
  })

  it('keeps a weekday streak over the weekend and counts Monday as the next day', () => {
    const weekdayLogs = [
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
      '2026-06-04',
      '2026-06-05',
    ]

    expect(
      calculateStreakFromDates(weekdayLogs, '2026-06-07', 'weekdays')
    ).toBe(5)
    expect(
      calculateStreakFromDates(weekdayLogs, '2026-06-08', 'weekdays')
    ).toBe(5)
    expect(
      calculateStreakFromDates(
        [...weekdayLogs, '2026-06-08'],
        '2026-06-08',
        'weekdays'
      )
    ).toBe(6)
  })

  it('breaks a weekday streak when a scheduled day is missed', () => {
    expect(
      calculateStreakFromDates(
        ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05'],
        '2026-06-09',
        'weekdays'
      )
    ).toBe(0)
  })

  it('calculates the best streak by scheduled days, skipping unscheduled days', () => {
    expect(
      bestHistoricalStreak(
        [
          '2026-06-01',
          '2026-06-02',
          '2026-06-03',
          '2026-06-04',
          '2026-06-05',
          '2026-06-08',
          '2026-06-09',
        ],
        'weekdays'
      )
    ).toBe(7)
  })
})
