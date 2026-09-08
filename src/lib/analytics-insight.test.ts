import { describe, expect, it } from 'vitest'
import {
  buildAnalyticsInsight,
  compareAnalyticsPeriods,
} from './analytics-insight'

const signals = [
  { key: 'focusDepth' as const, ratio: 0.8 },
  { key: 'taskFlow' as const, ratio: 0.55 },
  { key: 'activeCadence' as const, ratio: 0.4 },
  { key: 'habitMomentum' as const, ratio: 0.25 },
]

describe('buildAnalyticsInsight', () => {
  it('does not judge a period without recorded activity', () => {
    expect(
      buildAnalyticsInsight({ score: 0, signals, hasData: false })
    ).toEqual({ level: 'empty', strongest: null, weakest: null })
  })

  it.each([
    [75, 'strong'],
    [55, 'steady'],
    [35, 'uneven'],
    [34, 'low'],
  ] as const)('maps score %s to the %s diagnosis', (score, level) => {
    expect(buildAnalyticsInsight({ score, signals, hasData: true }).level).toBe(
      level
    )
  })

  it('returns the strongest and weakest evidence with clamped percentages', () => {
    const result = buildAnalyticsInsight({
      score: 68,
      hasData: true,
      signals: [
        { key: 'focusDepth', ratio: 1.4 },
        { key: 'taskFlow', ratio: -0.2 },
        { key: 'activeCadence', ratio: 0.674 },
      ],
    })

    expect(result.strongest).toEqual({ key: 'focusDepth', percentage: 100 })
    expect(result.weakest).toEqual({ key: 'taskFlow', percentage: 0 })
  })

  it('keeps the first signal when percentages tie', () => {
    const result = buildAnalyticsInsight({
      score: 60,
      hasData: true,
      signals: [
        { key: 'focusDepth', ratio: 0.5 },
        { key: 'taskFlow', ratio: 0.5 },
      ],
    })

    expect(result.strongest?.key).toBe('focusDepth')
    expect(result.weakest?.key).toBe('focusDepth')
  })
})

describe('compareAnalyticsPeriods', () => {
  it('describes activity with no previous baseline as new', () => {
    expect(compareAnalyticsPeriods(3, 0)).toEqual({ kind: 'new' })
  })

  it('describes two empty periods without manufacturing a percentage', () => {
    expect(compareAnalyticsPeriods(0, 0)).toEqual({ kind: 'empty' })
  })

  it('returns the percentage change when a previous value exists', () => {
    expect(compareAnalyticsPeriods(3, 2)).toEqual({
      kind: 'change',
      value: 50,
    })
  })
})
