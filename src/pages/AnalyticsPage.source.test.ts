import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Analytics page visual contract', () => {
  it('puts an explainable diagnosis before detailed indicators', () => {
    const source = readFileSync(resolve('src/pages/AnalyticsPage.tsx'), 'utf8')

    expect(source).toContain('buildAnalyticsInsight')
    expect(source).toContain('<AnalysisSummary')
    expect(source.indexOf('<AnalysisSummary')).toBeLessThan(
      source.indexOf("t('analytics.details.title')")
    )
    expect(source).toContain("t('analytics.insight.nextAdjustment')")
    expect(source).toContain("t('analytics.insight.supportedBy')")
    expect(source).toContain("t('analytics.insight.needsAttention')")
    expect(source).toContain('const focusGrade = hasRecordedActivity')
  })

  it('uses the shared semantic depth system without decorative gradients', () => {
    const source = readFileSync(resolve('src/pages/AnalyticsPage.tsx'), 'utf8')

    expect(source).toContain('bg-surface shadow-neu-raised')
    expect(source).toContain('bg-surface-sunken')
    expect(source).toContain('shadow-neu-pressed')
    expect(source).toContain('aria-pressed={period === p.value}')
    expect(source).not.toContain('gradient')
    expect(source).not.toContain('backdrop-blur')
    expect(source).not.toContain('bg-card/')
    expect(source).not.toContain('transition-all')
  })

  it('uses task activity piles instead of repeating the habit consistency map', () => {
    const source = readFileSync(resolve('src/pages/AnalyticsPage.tsx'), 'utf8')

    expect(source).toContain('function TaskActivityStack')
    expect(source).toContain('scaleTaskActivityPile')
    expect(source).toContain('<TaskActivityStack')
    expect(source).toContain("t('analytics.taskActivity.completionRate')")
    expect(source).toContain('className="h-3 w-9')
    expect(source).not.toContain('analytics.consistency')
    expect(source).not.toContain('buildContributionWeeks')
    expect(source).not.toContain('BarChart')
  })

  it('keeps indicators floating and removes decorative sparklines', () => {
    const source = readFileSync(resolve('src/pages/AnalyticsPage.tsx'), 'utf8')

    expect(source).toContain('compareAnalyticsPeriods')
    expect(source).toContain("t('analytics.stat.newInPeriod')")
    expect(source).toContain("t('analytics.stat.noActivity')")
    expect(source).not.toContain('function Sparkline')
    expect(source).not.toContain('sparklineData')
    expect(source).not.toContain('analytics.stat.noBaseline')
    expect(source).toContain('<section className="py-2">')
  })
})
