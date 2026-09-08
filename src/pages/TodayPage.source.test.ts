import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const pageSource = readFileSync(resolve('src/pages/TodayPage.tsx'), 'utf8')
const mainSource = readFileSync(
  resolve('src/components/layout/MainWindowContent.tsx'),
  'utf8'
)
const nowSource = readFileSync(
  resolve('src/components/today/TodayNow.tsx'),
  'utf8'
)
const timelineSource = readFileSync(
  resolve('src/components/today/TodayTimeline.tsx'),
  'utf8'
)
const captureSource = readFileSync(
  resolve('src/components/today/TodayCapture.tsx'),
  'utf8'
)

describe('TodayPage surface contract', () => {
  it('renders the fixed daily hierarchy in canonical order', () => {
    const sections = [
      '<TodayNow',
      '<TodayTimeline',
      '<TodayHabits',
      '<TodayCapture',
      '<TodayWrapUp',
    ]
    const positions = sections.map(section => pageSource.indexOf(section))

    expect(positions.every(position => position >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  it('replaces the free widget grid on the Today destination', () => {
    expect(mainSource).toContain('<TodayPage />')
    expect(mainSource).not.toContain('<BentoGrid />')
    expect(mainSource).not.toContain('<WidgetToggleMenu />')
  })

  it('keeps the daily surface free from decorative gradients', () => {
    expect(pageSource).not.toContain('gradient')
    expect(pageSource).not.toContain('Math.random')
  })

  it('opens at the daily heading and keeps that context available while scrolling', () => {
    expect(pageSource).toContain(
      'scrollContainerRef.current?.scrollTo({ top: 0 })'
    )
    expect(pageSource).toContain('sticky top-0')
  })

  it('keeps empty states compact and capture behavior explicit', () => {
    expect(nowSource).not.toContain('min-h-56')
    expect(nowSource).toContain("nextCommitment ? 'justify-between gap-7'")
    expect(timelineSource).not.toContain('min-h-36')
    expect(captureSource).toContain("t('today.capture.open')")
  })
})
