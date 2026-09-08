import { describe, expect, it } from 'vitest'
import {
  buildTaskActivityBuckets,
  scaleTaskActivityPile,
} from './analytics-task-activity'

describe('buildTaskActivityBuckets', () => {
  const data = [
    { day: '2026-09-01', created: 2, completed: 1 },
    { day: '2026-09-02', created: 1, completed: 1 },
    { day: '2026-09-08', created: 3, completed: 2 },
  ]

  it('keeps daily piles for the current week', () => {
    const buckets = buildTaskActivityBuckets({
      data,
      period: 'this_week',
      locale: 'pt-BR',
    })

    expect(buckets).toHaveLength(3)
    expect(buckets[0]).toMatchObject({ created: 2, completed: 1 })
  })

  it('groups a month into weekly piles', () => {
    const buckets = buildTaskActivityBuckets({
      data,
      period: 'this_month',
      locale: 'pt-BR',
    })

    expect(buckets).toHaveLength(2)
    expect(buckets[0]).toMatchObject({ created: 3, completed: 2 })
    expect(buckets[1]).toMatchObject({ created: 3, completed: 2 })
  })

  it('removes empty years and limits all-time activity to twelve piles', () => {
    const yearlyData = Array.from({ length: 15 }, (_, index) => ({
      day: `${2010 + index}-01-01`,
      created: index === 0 ? 0 : 1,
      completed: index === 0 ? 0 : 1,
    }))

    const buckets = buildTaskActivityBuckets({
      data: yearlyData,
      period: 'all_time',
      locale: 'en',
    })

    expect(buckets).toHaveLength(12)
    expect(buckets[0]?.day).toBe('2013')
    expect(buckets.at(-1)?.day).toBe('2024')
  })
})

describe('scaleTaskActivityPile', () => {
  it('preserves both task states in a small pile', () => {
    expect(
      scaleTaskActivityPile({ created: 1, completed: 1, maxTotal: 20 })
    ).toEqual({ createdBlocks: 1, completedBlocks: 1 })
  })

  it('uses the full available height for the largest pile', () => {
    const pile = scaleTaskActivityPile({
      created: 8,
      completed: 4,
      maxTotal: 12,
    })

    expect(pile.createdBlocks + pile.completedBlocks).toBe(12)
    expect(pile).toEqual({ createdBlocks: 8, completedBlocks: 4 })
  })

  it('returns an empty pile when there is no activity', () => {
    expect(
      scaleTaskActivityPile({ created: 0, completed: 0, maxTotal: 0 })
    ).toEqual({ createdBlocks: 0, completedBlocks: 0 })
  })
})
