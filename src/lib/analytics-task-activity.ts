import type { AnalyticsPeriod } from './analytics-domain'

export interface TaskActivityPoint {
  day: string
  created: number
  completed: number
}

export interface TaskActivityBucket extends TaskActivityPoint {
  label: string
}

export interface TaskActivityPile {
  createdBlocks: number
  completedBlocks: number
}

type TaskActivityGranularity = 'day' | 'week' | 'month' | 'year'

function granularityForPeriod(
  period: AnalyticsPeriod
): TaskActivityGranularity {
  switch (period) {
    case 'this_week':
    case 'last_week':
      return 'day'
    case 'this_month':
    case 'last_30_days':
    case 'last_90_days':
      return 'week'
    case 'this_year':
      return 'month'
    case 'all_time':
      return 'year'
  }
}

function parseDay(day: string): Date {
  return new Date(`${day}T12:00:00Z`)
}

function toISODate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function startOfWeek(day: string): string {
  const date = parseDay(day)
  const weekday = date.getUTCDay()
  const offset = weekday === 0 ? -6 : 1 - weekday
  date.setUTCDate(date.getUTCDate() + offset)
  return toISODate(date)
}

function bucketKey(day: string, granularity: TaskActivityGranularity): string {
  const date = parseDay(day)
  switch (granularity) {
    case 'day':
      return day
    case 'week':
      return startOfWeek(day)
    case 'month':
      return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
    case 'year':
      return String(date.getUTCFullYear())
  }
}

function bucketLabel(
  key: string,
  granularity: TaskActivityGranularity,
  locale: string
): string {
  if (granularity === 'year') return key

  const day = granularity === 'month' ? `${key}-01` : key
  const date = parseDay(day)
  const options: Intl.DateTimeFormatOptions =
    granularity === 'day'
      ? { weekday: 'short' }
      : granularity === 'month'
        ? { month: 'short' }
        : { day: 'numeric', month: 'short' }

  return new Intl.DateTimeFormat(locale, options).format(date)
}

export function buildTaskActivityBuckets({
  data,
  period,
  locale,
}: {
  data: TaskActivityPoint[]
  period: AnalyticsPeriod
  locale: string
}): TaskActivityBucket[] {
  const granularity = granularityForPeriod(period)
  const grouped = new Map<string, TaskActivityPoint>()

  for (const point of data) {
    const key = bucketKey(point.day, granularity)
    const existing = grouped.get(key)
    grouped.set(key, {
      day: key,
      created: (existing?.created ?? 0) + point.created,
      completed: (existing?.completed ?? 0) + point.completed,
    })
  }

  const buckets = Array.from(grouped.values())
    .sort((a, b) => a.day.localeCompare(b.day))
    .map(bucket => ({
      ...bucket,
      label: bucketLabel(bucket.day, granularity, locale),
    }))

  if (period !== 'all_time') return buckets

  const activeBuckets = buckets.filter(
    bucket => bucket.created > 0 || bucket.completed > 0
  )
  return activeBuckets.length > 0 ? activeBuckets.slice(-12) : buckets.slice(-1)
}

export function scaleTaskActivityPile({
  created,
  completed,
  maxTotal,
  maxBlocks = 12,
}: {
  created: number
  completed: number
  maxTotal: number
  maxBlocks?: number
}): TaskActivityPile {
  const total = Math.max(0, created) + Math.max(0, completed)
  if (total === 0 || maxTotal <= 0 || maxBlocks <= 0) {
    return { createdBlocks: 0, completedBlocks: 0 }
  }

  let totalBlocks = Math.max(1, Math.round((total / maxTotal) * maxBlocks))
  if (created > 0 && completed > 0) totalBlocks = Math.max(2, totalBlocks)
  totalBlocks = Math.min(maxBlocks, totalBlocks)

  let completedBlocks = Math.round((completed / total) * totalBlocks)
  if (completed > 0) completedBlocks = Math.max(1, completedBlocks)
  if (created > 0) completedBlocks = Math.min(totalBlocks - 1, completedBlocks)

  return {
    createdBlocks: totalBlocks - completedBlocks,
    completedBlocks,
  }
}
