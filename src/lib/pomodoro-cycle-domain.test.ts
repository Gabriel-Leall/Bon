import { describe, expect, it } from 'vitest'
import { getPomodoroCycleProgress } from './pomodoro-cycle-domain'

describe('getPomodoroCycleProgress', () => {
  it('starts the first focus at 1 of the configured cycle', () => {
    expect(getPomodoroCycleProgress('focus', 0, 3)).toEqual({
      current: 1,
      completed: 0,
      total: 3,
    })
  })

  it('keeps the completed focus position visible during its break', () => {
    expect(getPomodoroCycleProgress('short_break', 1, 3)).toEqual({
      current: 1,
      completed: 1,
      total: 3,
    })
  })

  it('advances the displayed position when the next focus starts', () => {
    expect(getPomodoroCycleProgress('focus', 1, 3)).toEqual({
      current: 2,
      completed: 1,
      total: 3,
    })
  })

  it('keeps the final position during the long break then resets on next focus', () => {
    expect(getPomodoroCycleProgress('long_break', 3, 3)).toEqual({
      current: 3,
      completed: 3,
      total: 3,
    })
    expect(getPomodoroCycleProgress('focus', 3, 3)).toEqual({
      current: 1,
      completed: 0,
      total: 3,
    })
  })

  it('starts a new displayed cycle after a long-break boundary', () => {
    expect(getPomodoroCycleProgress('short_break', 4, 3)).toEqual({
      current: 1,
      completed: 1,
      total: 3,
    })
    expect(getPomodoroCycleProgress('focus', 4, 3)).toEqual({
      current: 2,
      completed: 1,
      total: 3,
    })
  })

  it('normalizes invalid settings and completed counts', () => {
    expect(getPomodoroCycleProgress('focus', -4, 0)).toEqual({
      current: 1,
      completed: 0,
      total: 1,
    })
  })
})
