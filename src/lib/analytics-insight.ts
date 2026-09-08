export type AnalyticsSignalKey =
  | 'focusDepth'
  | 'taskFlow'
  | 'activeCadence'
  | 'habitMomentum'

export type AnalyticsInsightLevel =
  | 'empty'
  | 'strong'
  | 'steady'
  | 'uneven'
  | 'low'

export interface AnalyticsSignal {
  key: AnalyticsSignalKey
  ratio: number
}

export interface AnalyticsInsightSignal {
  key: AnalyticsSignalKey
  percentage: number
}

export interface AnalyticsInsight {
  level: AnalyticsInsightLevel
  strongest: AnalyticsInsightSignal | null
  weakest: AnalyticsInsightSignal | null
}

export type PeriodComparison =
  | { kind: 'change'; value: number }
  | { kind: 'new' }
  | { kind: 'empty' }

export function compareAnalyticsPeriods(
  current: number,
  previous: number
): PeriodComparison {
  if (previous === 0) return current === 0 ? { kind: 'empty' } : { kind: 'new' }
  return { kind: 'change', value: ((current - previous) / previous) * 100 }
}

function toPercentage(ratio: number): number {
  return Math.round(Math.max(0, Math.min(1, ratio)) * 100)
}

export function buildAnalyticsInsight({
  score,
  signals,
  hasData,
}: {
  score: number
  signals: AnalyticsSignal[]
  hasData: boolean
}): AnalyticsInsight {
  if (!hasData || signals.length === 0) {
    return { level: 'empty', strongest: null, weakest: null }
  }

  const normalized = signals.map(signal => ({
    key: signal.key,
    percentage: toPercentage(signal.ratio),
  }))

  const strongest = normalized.reduce((best, signal) =>
    signal.percentage > best.percentage ? signal : best
  )
  const weakest = normalized.reduce((lowest, signal) =>
    signal.percentage < lowest.percentage ? signal : lowest
  )

  const clampedScore = Math.max(0, Math.min(100, score))
  const level: AnalyticsInsightLevel =
    clampedScore >= 75
      ? 'strong'
      : clampedScore >= 55
        ? 'steady'
        : clampedScore >= 35
          ? 'uneven'
          : 'low'

  return { level, strongest, weakest }
}
