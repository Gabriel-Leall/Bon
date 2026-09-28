import type { SessionType } from '@/store/pomodoro-types'

export interface PomodoroCycleProgress {
  /** The one-based Pomodoro position currently underway or just completed. */
  current: number
  /** Completed focus sessions in the current long-break cycle. */
  completed: number
  /** Configured number of focus sessions before a long break. */
  total: number
}

/**
 * Derives the visible cycle position from completed focus sessions and phase.
 * Focus displays the next Pomodoro; a break keeps the position of the focus
 * session that just completed. After the long break, the next focus starts at 1.
 */
export function getPomodoroCycleProgress(
  currentType: SessionType,
  cyclesCompleted: number,
  pomosUntilLongBreak: number
): PomodoroCycleProgress {
  const total = Number.isFinite(pomosUntilLongBreak)
    ? Math.max(1, Math.floor(pomosUntilLongBreak))
    : 1
  const completedCount = Number.isFinite(cyclesCompleted)
    ? Math.max(0, Math.floor(cyclesCompleted))
    : 0
  const completedWithinCycle = completedCount % total

  if (currentType === 'focus') {
    return {
      current: completedWithinCycle + 1,
      completed: completedWithinCycle,
      total,
    }
  }

  if (completedCount === 0) {
    return { current: 1, completed: 0, total }
  }

  const current = ((completedCount - 1) % total) + 1
  return { current, completed: current, total }
}
