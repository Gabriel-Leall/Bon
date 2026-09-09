import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Activity, Minus, Target, TrendingDown, TrendingUp } from 'lucide-react'
import {
  completionRate,
  fillMissingDays,
  formatDuration,
  getPeriodRange,
  type AnalyticsPeriod,
} from '@/lib/analytics-domain'
import {
  buildAnalyticsInsight,
  compareAnalyticsPeriods,
  type AnalyticsInsight,
  type AnalyticsSignal,
  type AnalyticsSignalKey,
  type PeriodComparison,
} from '@/lib/analytics-insight'
import {
  buildTaskActivityBuckets,
  scaleTaskActivityPile,
  type TaskActivityBucket,
} from '@/lib/analytics-task-activity'
import { cn } from '@/lib/utils'
import { useAnalyticsStore } from '@/store/analytics-store'

function comparisonLabel(
  period: AnalyticsPeriod,
  t: (k: string) => string
): string {
  switch (period) {
    case 'this_week':
      return t('analytics.comparison.vsLastWeek')
    case 'this_month':
      return t('analytics.comparison.vsLastMonth')
    case 'this_year':
      return t('analytics.comparison.vsLastYear')
    case 'all_time':
      return t('analytics.comparison.vsPrevious')
    default:
      return t('analytics.comparison.vsPrevious')
  }
}

function gradeFromScore(score: number): string {
  if (score >= 92) return 'A+'
  if (score >= 85) return 'A'
  if (score >= 78) return 'B+'
  if (score >= 70) return 'B'
  if (score >= 62) return 'C+'
  if (score >= 55) return 'C'
  return 'D'
}

function TrendDelta({
  comparison,
  label,
}: {
  comparison: PeriodComparison
  label: string
}) {
  const { t } = useTranslation()
  if (comparison.kind === 'empty') {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Minus className="size-3" aria-hidden />
        {t('analytics.stat.noActivity')}
      </span>
    )
  }

  if (comparison.kind === 'new') {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-primary">
        <TrendingUp className="size-3" aria-hidden />
        {t('analytics.stat.newInPeriod')}
      </span>
    )
  }

  const positive = comparison.value >= 0
  const value = Math.min(999, Math.round(Math.abs(comparison.value)))
  const TrendIcon = positive ? TrendingUp : TrendingDown

  return (
    <span className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-muted-foreground">
      <TrendIcon className="size-3" aria-hidden />
      {value}% {label}
    </span>
  )
}

function StatBox({
  title,
  value,
  subtitle,
  comparison,
  deltaLabel,
}: {
  title: string
  value: string | number
  subtitle?: string
  comparison: PeriodComparison
  deltaLabel: string
}) {
  return (
    <article className="flex min-h-38 flex-col justify-between gap-5 rounded-2xl border border-border bg-surface-elevated p-5 shadow-neu-raised-sm">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>

      <div className="flex flex-col gap-2">
        <span className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
          {value}
        </span>
        <span className="min-h-4 text-xs font-medium text-muted-foreground">
          {subtitle ?? ''}
        </span>
        <TrendDelta comparison={comparison} label={deltaLabel} />
      </div>
    </article>
  )
}

function PeriodToggle() {
  const { t } = useTranslation()
  const period = useAnalyticsStore(state => state.period)
  const setPeriod = useAnalyticsStore(state => state.setPeriod)

  const periods: { value: AnalyticsPeriod; label: string }[] = [
    { value: 'this_week', label: t('analytics.period.sevenDays') },
    { value: 'this_month', label: t('analytics.period.thirtyDays') },
    { value: 'this_year', label: t('analytics.period.oneYear') },
    { value: 'all_time', label: t('analytics.period.allTime') },
  ]

  return (
    <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-surface-sunken p-1.5 shadow-neu-pressed">
      {periods.map(p => (
        <button
          type="button"
          key={p.value}
          onClick={() => setPeriod(p.value)}
          aria-pressed={period === p.value}
          className={cn(
            'rounded-lg border px-3.5 py-2 text-xs font-semibold transition-[background-color,color,border-color,box-shadow,transform] active:translate-y-px active:shadow-neu-pressed motion-reduce:transform-none',
            period === p.value
              ? 'border-border-strong bg-surface-elevated text-foreground shadow-neu-raised-sm'
              : 'border-transparent text-muted-foreground hover:bg-surface hover:text-foreground'
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const { t } = useTranslation()
  const radius = 84
  const strokeWidth = 14
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, score))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className="relative mx-auto size-48 rounded-full border border-border bg-surface-sunken p-3 shadow-neu-pressed">
      <svg
        className="size-full -rotate-90"
        viewBox="0 0 220 220"
        role="img"
        aria-label={
          grade === '—'
            ? t('analytics.focusScore.noData')
            : t('analytics.focusScore.aria', { score })
        }
      >
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="color-mix(in oklab, var(--muted) 72%, transparent)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition:
              'stroke-dashoffset 400ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold tracking-tight text-foreground">
          {grade}
        </span>
        <span className="font-mono text-sm text-muted-foreground">
          {grade === '—' ? t('analytics.focusScore.noData') : `${score}%`}
        </span>
      </div>
    </div>
  )
}

function signalLabel(
  key: AnalyticsSignalKey,
  t: (key: string) => string
): string {
  return t(`analytics.focusScore.${key}`)
}

function AnalysisSummary({
  insight,
  score,
  grade,
  signals,
}: {
  insight: AnalyticsInsight
  score: number
  grade: string
  signals: AnalyticsSignal[]
}) {
  const { t } = useTranslation()
  const strongest = insight.strongest
  const weakest = insight.weakest
  const hasEvidence = strongest !== null && weakest !== null
  const recommendationKey = weakest
    ? `analytics.insight.recommendation.${weakest.key}`
    : 'analytics.insight.recommendation.empty'

  return (
    <section className="grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-start">
      <div className="px-1 py-3 sm:px-2 sm:py-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full border border-border-strong bg-surface-elevated text-primary shadow-neu-raised-sm">
            <Activity className="size-5" aria-hidden />
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {t('analytics.insight.heading')}
          </span>
        </div>

        <h2 className="mt-6 max-w-2xl text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
          {t(`analytics.insight.level.${insight.level}.title`)}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          {t(`analytics.insight.level.${insight.level}.body`, { score })}
        </p>

        {hasEvidence ? (
          <div className="mt-7 grid border-y border-border sm:grid-cols-2 sm:divide-x sm:divide-border">
            <div className="py-4 sm:pe-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <TrendingUp className="size-4 text-primary" aria-hidden />
                {t('analytics.insight.supportedBy')}
              </div>
              <p className="mt-3 font-semibold text-foreground">
                {signalLabel(strongest.key, t)}
              </p>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                {strongest.percentage}%
              </p>
            </div>
            <div className="py-4 sm:ps-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <TrendingDown
                  className="size-4 text-muted-foreground"
                  aria-hidden
                />
                {t('analytics.insight.needsAttention')}
              </div>
              <p className="mt-3 font-semibold text-foreground">
                {signalLabel(weakest.key, t)}
              </p>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                {weakest.percentage}%
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-7 flex gap-3 rounded-2xl border border-border-strong bg-surface-elevated p-4 shadow-neu-raised-sm">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-primary shadow-neu-raised-sm">
            <Target className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t('analytics.insight.nextAdjustment')}
            </p>
            <p className="mt-1.5 text-sm leading-6 text-foreground">
              {t(recommendationKey)}
            </p>
          </div>
        </div>
      </div>

      <aside className="rounded-[2rem] border border-border bg-surface p-6 shadow-neu-raised lg:p-8">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">
            {t('analytics.focusScore.title')}
          </h3>
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {t('analytics.focusScore.weightedIndex')}
          </span>
        </div>

        <div className="mt-6">
          <ScoreRing score={score} grade={grade} />
        </div>

        <p className="mt-6 text-xs leading-5 text-muted-foreground">
          {t('analytics.insight.scoreExplanation')}
        </p>
        {hasEvidence ? (
          <div className="mt-4 divide-y divide-border border-y border-border">
            {signals.map(signal => (
              <div
                key={signal.key}
                className="flex items-center justify-between gap-3 py-2.5 text-sm"
              >
                <span className="text-muted-foreground">
                  {signalLabel(signal.key, t)}
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {Math.round(signal.ratio * 100)}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-border bg-surface-sunken px-4 py-5 text-center text-sm font-medium text-muted-foreground shadow-neu-pressed">
            {t('analytics.focusScore.noData')}
          </div>
        )}
      </aside>
    </section>
  )
}

function TaskActivityStack({
  buckets,
  rate,
}: {
  buckets: TaskActivityBucket[]
  rate: number
}) {
  const { t } = useTranslation()
  const maxTotal = Math.max(
    ...buckets.map(bucket => bucket.created + bucket.completed),
    0
  )
  const hasActivity = maxTotal > 0

  return (
    <section>
      <div className="flex flex-col gap-4 px-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {t('analytics.taskActivity.title')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('analytics.taskActivity.description')}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-5 rounded-[3px] border border-primary bg-primary shadow-neu-raised-sm" />
            {t('analytics.taskActivity.completed')}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-5 rounded-[3px] border border-border-strong bg-surface shadow-neu-raised-sm" />
            {t('analytics.taskActivity.created')}
          </span>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-surface shadow-neu-raised">
        <div className="px-4 pb-4 pt-6 sm:px-6 sm:pt-8">
          {hasActivity ? (
            <div className="flex min-h-64 items-end gap-5 overflow-x-auto pb-1 sm:justify-around sm:gap-7">
              {buckets.map(bucket => {
                const pile = scaleTaskActivityPile({
                  created: bucket.created,
                  completed: bucket.completed,
                  maxTotal,
                })
                const total = bucket.created + bucket.completed

                return (
                  <div
                    key={bucket.day}
                    role="img"
                    tabIndex={0}
                    aria-label={t('analytics.taskActivity.pileAria', {
                      label: bucket.label,
                      created: bucket.created,
                      completed: bucket.completed,
                    })}
                    className="group flex min-w-16 flex-1 flex-col items-center rounded-lg px-2 py-2 outline-none transition-[background-color,box-shadow] hover:bg-surface-elevated focus-visible:bg-surface-elevated focus-visible:shadow-focus-ring"
                  >
                    <span className="mb-3 font-mono text-xs font-semibold tabular-nums text-muted-foreground">
                      {total}
                    </span>
                    <span className="flex h-54 flex-col-reverse justify-start gap-1">
                      {Array.from(
                        { length: pile.completedBlocks },
                        (_, index) => (
                          <span
                            key={`completed-${index}`}
                            className="h-3 w-9 shrink-0 rounded-[3px] border border-primary bg-primary shadow-neu-raised-sm transition-transform group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5 motion-reduce:transform-none"
                          />
                        )
                      )}
                      {Array.from(
                        { length: pile.createdBlocks },
                        (_, index) => (
                          <span
                            key={`created-${index}`}
                            className="h-3 w-9 shrink-0 rounded-[3px] border border-border-strong bg-surface-elevated shadow-neu-raised-sm transition-transform group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5 motion-reduce:transform-none"
                          />
                        )
                      )}
                    </span>
                    <span className="mt-3 max-w-18 truncate text-xs font-medium text-muted-foreground">
                      {bucket.label}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="grid min-h-64 place-items-center text-center text-sm text-muted-foreground">
              {t('analytics.taskActivity.empty')}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-border bg-surface-elevated px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <p className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-primary">
              {rate}%
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t('analytics.taskActivity.completionRate')}
            </p>
          </div>
          <p className="max-w-md text-xs leading-5 text-muted-foreground sm:text-end">
            {t('analytics.taskActivity.rateExplanation')}
          </p>
        </div>
      </div>
    </section>
  )
}

type AnalyticsState = ReturnType<typeof useAnalyticsStore.getState>

function buildAnalyticsViewModel({
  period,
  summary,
  previousSummary,
  focusTimeData,
  taskCountData,
  pomodoroSummary,
  habitLogs,
  locale,
  t,
}: Pick<
  AnalyticsState,
  | 'period'
  | 'summary'
  | 'previousSummary'
  | 'focusTimeData'
  | 'taskCountData'
  | 'pomodoroSummary'
  | 'habitLogs'
> & {
  locale: string
  t: TFunction
}) {
  const periodRange = getPeriodRange(period)
  const filledFocusData = fillMissingDays(
    focusTimeData,
    periodRange.start,
    periodRange.end
  ).map(row => ({
    day: row.day as string,
    total_seconds: (row.total_seconds as number) ?? 0,
  }))
  const filledTaskData = fillMissingDays(
    taskCountData,
    periodRange.start,
    periodRange.end
  ).map(row => ({
    day: row.day as string,
    created: (row.created as number) ?? 0,
    completed: (row.completed as number) ?? 0,
  }))

  const focusComparison = compareAnalyticsPeriods(
    summary?.total_focus_seconds ?? 0,
    previousSummary?.total_focus_seconds ?? 0
  )
  const taskComparison = compareAnalyticsPeriods(
    summary?.tasks_completed ?? 0,
    previousSummary?.tasks_completed ?? 0
  )
  const pomodoroComparison = compareAnalyticsPeriods(
    summary?.pomodoros_completed ?? 0,
    previousSummary?.pomodoros_completed ?? 0
  )
  const activeDaysComparison = compareAnalyticsPeriods(
    summary?.days_active ?? 0,
    previousSummary?.days_active ?? 0
  )
  const focusSessions = pomodoroSummary.find(
    session => session.session_type === 'focus'
  )
  const averageSessionMinutes =
    focusSessions && focusSessions.sessions > 0
      ? Math.round(focusSessions.total_seconds / focusSessions.sessions / 60)
      : 0
  const trackedDays = Math.max(filledFocusData.length, 1)
  const focusTargetRatio = Math.min(
    (summary?.total_focus_seconds ?? 0) / (trackedDays * 45 * 60),
    1
  )
  const taskFlowRatio = Math.min(
    (summary?.tasks_completed ?? 0) / Math.max(summary?.tasks_created ?? 1, 1),
    1
  )
  const activeCadenceRatio = Math.min(
    (summary?.days_active ?? 0) / trackedDays,
    1
  )
  const habitStreakRatio = Math.min(
    (summary?.best_habit_streak ?? 0) /
      Math.max(Math.round(trackedDays * 0.35), 1),
    1
  )
  const focusScore = Math.round(
    focusTargetRatio * 35 +
      taskFlowRatio * 30 +
      activeCadenceRatio * 20 +
      habitStreakRatio * 15
  )
  const hasRecordedActivity = Boolean(
    (summary?.total_focus_seconds ?? 0) > 0 ||
    (summary?.tasks_created ?? 0) > 0 ||
    (summary?.tasks_completed ?? 0) > 0 ||
    (summary?.pomodoros_completed ?? 0) > 0 ||
    (summary?.days_active ?? 0) > 0 ||
    habitLogs.length > 0
  )
  const focusGrade = hasRecordedActivity ? gradeFromScore(focusScore) : '—'
  const analyticsSignals = [
    { key: 'focusDepth', ratio: focusTargetRatio },
    { key: 'taskFlow', ratio: taskFlowRatio },
    { key: 'activeCadence', ratio: activeCadenceRatio },
    { key: 'habitMomentum', ratio: habitStreakRatio },
  ] satisfies AnalyticsSignal[]

  return {
    analyticsSignals,
    focusScore,
    focusGrade,
    insight: buildAnalyticsInsight({
      score: focusScore,
      signals: analyticsSignals,
      hasData: hasRecordedActivity,
    }),
    compLabel: comparisonLabel(period, t),
    taskActivityBuckets: buildTaskActivityBuckets({
      data: filledTaskData,
      period,
      locale,
    }),
    taskCompletionRate: Math.min(
      100,
      completionRate(summary?.tasks_created ?? 0, summary?.tasks_completed ?? 0)
    ),
    focusStat: {
      value: formatDuration(summary?.total_focus_seconds ?? 0),
      subtitle: summary?.top_productivity_day
        ? t('analytics.stat.peak', {
            day: new Date(summary.top_productivity_day).toLocaleDateString(
              locale,
              { weekday: 'long' }
            ),
          })
        : undefined,
      comparison: focusComparison,
    },
    taskStat: {
      value: summary?.tasks_completed ?? 0,
      subtitle: t('analytics.stat.itemsCreated', {
        count: summary?.tasks_created ?? 0,
      }),
      comparison: taskComparison,
    },
    pomodoroStat: {
      value: summary?.pomodoros_completed ?? 0,
      subtitle:
        averageSessionMinutes > 0
          ? t('analytics.stat.avgSession', {
              minutes: averageSessionMinutes,
            })
          : undefined,
      comparison: pomodoroComparison,
    },
    activeDaysStat: {
      value: summary?.days_active ?? 0,
      comparison: activeDaysComparison,
    },
  }
}

export default function AnalyticsPage() {
  const { t, i18n } = useTranslation()
  const period = useAnalyticsStore(state => state.period)
  const loadData = useAnalyticsStore(state => state.loadData)
  const summary = useAnalyticsStore(state => state.summary)
  const previousSummary = useAnalyticsStore(state => state.previousSummary)
  const focusTimeData = useAnalyticsStore(state => state.focusTimeData)
  const taskCountData = useAnalyticsStore(state => state.taskCountData)
  const pomodoroSummary = useAnalyticsStore(state => state.pomodoroSummary)
  const habitLogs = useAnalyticsStore(state => state.habitLogs)
  const isLoading = useAnalyticsStore(state => state.isLoading)

  useEffect(() => {
    void loadData()
  }, [loadData])

  const viewModel = buildAnalyticsViewModel({
    period,
    summary,
    previousSummary,
    focusTimeData,
    taskCountData,
    pomodoroSummary,
    habitLogs,
    locale: i18n.language,
    t,
  })

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-(--axis-content-max)">
        <header className="flex flex-col gap-5 px-5 pb-2 pt-7 md:flex-row md:items-end md:justify-between md:px-8 md:pt-9">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-[2rem]">
              {t('analytics.pageTitle')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('analytics.description')}
            </p>
          </div>
          <PeriodToggle />
        </header>

        <div
          className={cn(
            'flex flex-col gap-6 px-4 pb-10 pt-5 transition-opacity duration-300 md:px-8',
            isLoading ? 'pointer-events-none opacity-40' : 'opacity-100'
          )}
        >
          <AnalysisSummary
            insight={viewModel.insight}
            score={viewModel.focusScore}
            grade={viewModel.focusGrade}
            signals={viewModel.analyticsSignals}
          />

          <section className="py-2">
            <div className="px-1">
              <h2 className="text-base font-semibold text-foreground">
                {t('analytics.details.title')}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('analytics.details.description')}
              </p>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatBox
                title={t('analytics.stat.focusTime')}
                value={viewModel.focusStat.value}
                subtitle={viewModel.focusStat.subtitle}
                comparison={viewModel.focusStat.comparison}
                deltaLabel={viewModel.compLabel}
              />

              <StatBox
                title={t('analytics.stat.tasksCompleted')}
                value={viewModel.taskStat.value}
                subtitle={viewModel.taskStat.subtitle}
                comparison={viewModel.taskStat.comparison}
                deltaLabel={viewModel.compLabel}
              />

              <StatBox
                title={t('analytics.stat.pomodoros')}
                value={viewModel.pomodoroStat.value}
                subtitle={viewModel.pomodoroStat.subtitle}
                comparison={viewModel.pomodoroStat.comparison}
                deltaLabel={viewModel.compLabel}
              />

              <StatBox
                title={t('analytics.stat.daysActive')}
                value={viewModel.activeDaysStat.value}
                subtitle={t('analytics.stat.daysActiveSubtitle')}
                comparison={viewModel.activeDaysStat.comparison}
                deltaLabel={viewModel.compLabel}
              />
            </div>
          </section>

          <TaskActivityStack
            buckets={viewModel.taskActivityBuckets}
            rate={viewModel.taskCompletionRate}
          />
        </div>
      </div>
    </div>
  )
}
