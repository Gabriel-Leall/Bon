import { useEffect, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Moon,
  MoveRight,
  Repeat2,
  Sparkles,
  TimerReset,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getLocalISODate, type CalendarEvent } from '@/lib/calendar-domain'
import { notifications } from '@/lib/notifications'
import { recordProductUsage } from '@/lib/product-usage'
import {
  buildTomorrowFocusCandidates,
  buildWrapUpSnapshot,
  getTomorrowISO,
  type WrapUpSnapshot,
} from '@/lib/wrap-up-domain'
import {
  commands,
  type CreateDailyPlanInput,
  unwrapResult,
} from '@/lib/tauri-bindings'
import { cn } from '@/lib/utils'
import { useCalendarStore } from '@/store/calendar-store'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { useHabitsStore } from '@/store/habits-store'
import { usePomodoroStore } from '@/store/pomodoro-store'
import { type Task, useTasksStore } from '@/store/tasks-store'
import { useUIStore } from '@/store/ui-store'
import { BonCompanion } from '@/components/bon/BonCompanion'
import { getWrapUpBonState } from '@/lib/bon-domain'

const timeFormatters = new Map<string, Intl.DateTimeFormat>()
const dateFormatters = new Map<string, Intl.DateTimeFormat>()

function nowISO() {
  return new Date().toISOString()
}

function newId() {
  return crypto.randomUUID()
}

function formatEventTime(event: CalendarEvent, locale: string, allDay: string) {
  if (event.all_day) return allDay
  const date = new Date(event.start_date)
  if (Number.isNaN(date.getTime())) return allDay

  let formatter = timeFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    })
    timeFormatters.set(locale, formatter)
  }
  return formatter.format(date)
}

function formatTomorrowDate(dateISO: string, locale: string) {
  let formatter = dateFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    dateFormatters.set(locale, formatter)
  }
  return formatter.format(new Date(`${dateISO}T12:00:00`))
}

function buildTomorrowPlanInput(
  planDate: string,
  focusTaskId: string | null
): CreateDailyPlanInput {
  const timestamp = nowISO()
  return {
    id: newId(),
    plan_date: planDate,
    focus_task_id: focusTaskId,
    status: 'open',
    focus_source: 'manual',
    created_at: timestamp,
    updated_at: timestamp,
  }
}

async function saveTomorrowFocus(planDate: string, focusTaskId: string | null) {
  if (!focusTaskId) return
  const existing = unwrapResult(await commands.getDailyPlan(planDate))

  if (existing) {
    await unwrapResult(
      await commands.updateDailyPlanFocus(
        existing.id,
        focusTaskId,
        'manual',
        nowISO()
      )
    )
    return
  }

  await unwrapResult(
    await commands.createDailyPlan(
      buildTomorrowPlanInput(planDate, focusTaskId)
    )
  )
}

async function persistWrapUp({
  moveSelected,
  selectedCarryOver,
  tomorrow,
  tomorrowFocusId,
  updateTask,
  completePlan,
  initializeTodayPlan,
}: {
  moveSelected: boolean
  selectedCarryOver: Task[]
  tomorrow: string
  tomorrowFocusId: string | null
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  completePlan: () => Promise<void>
  initializeTodayPlan: () => Promise<void>
}) {
  if (moveSelected) {
    await Promise.all(
      selectedCarryOver.map(task => updateTask(task.id, { due_date: tomorrow }))
    )
  }

  await saveTomorrowFocus(tomorrow, tomorrowFocusId)
  if (tomorrowFocusId) void recordProductUsage('daily_focus_set')
  await completePlan()
  await initializeTodayPlan()
}

function SummaryMetric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 px-4 py-3 first:ps-0 last:pe-0">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border-strong bg-surface-elevated text-muted-foreground shadow-neu-raised-sm">
        {icon}
      </span>
      <span className="min-w-0">
        <strong className="block text-base font-semibold tabular-nums text-foreground">
          {value}
        </strong>
        <span className="block truncate text-xs text-muted-foreground">
          {label}
        </span>
      </span>
    </div>
  )
}

function CarryOverTask({
  task,
  selected,
  onToggle,
  selectedLabel,
  unselectedLabel,
}: {
  task: Task
  selected: boolean
  onToggle: () => void
  selectedLabel: string
  unselectedLabel: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        'group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start outline-none transition-[background-color,border-color,box-shadow,transform] active:translate-y-px focus-visible:shadow-focus-ring motion-reduce:transform-none',
        selected
          ? 'border-primary/45 bg-surface-sunken shadow-neu-pressed'
          : 'border-border bg-surface hover:border-border-strong hover:bg-surface-elevated hover:shadow-neu-raised-sm'
      )}
    >
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-lg border transition-colors',
          selected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border-strong bg-surface text-muted-foreground'
        )}
      >
        {selected ? (
          <Check className="size-4" />
        ) : (
          <Circle className="size-4" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{task.title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {selected ? selectedLabel : unselectedLabel}
        </span>
      </span>
    </button>
  )
}

function DaySummary({ snapshot }: { snapshot: WrapUpSnapshot }) {
  const { t } = useTranslation()
  const focusMinutes = Math.round(snapshot.focusSeconds / 60)

  return (
    <section
      aria-label={t('wrapUp.summaryHeading')}
      className="grid divide-y divide-border border-b border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4"
    >
      <SummaryMetric
        icon={<CheckCircle2 className="size-4" />}
        value={String(snapshot.completedTasks.length)}
        label={t('wrapUp.metric.completed')}
      />
      <SummaryMetric
        icon={<CalendarDays className="size-4" />}
        value={String(snapshot.todayEvents.length)}
        label={t('wrapUp.metric.commitments')}
      />
      <SummaryMetric
        icon={<TimerReset className="size-4" />}
        value={t('wrapUp.metric.focusValue', { count: focusMinutes })}
        label={t('wrapUp.metric.focus')}
      />
      <SummaryMetric
        icon={<Repeat2 className="size-4" />}
        value={`${snapshot.habitsDone}/${snapshot.habitsExpected}`}
        label={t('wrapUp.metric.habits')}
      />
    </section>
  )
}

function TodayReview({
  snapshot,
  essentialTask,
  selectedCarryOverIds,
  onToggle,
}: {
  snapshot: WrapUpSnapshot
  essentialTask: Task | undefined
  selectedCarryOverIds: Set<string>
  onToggle: (taskId: string) => void
}) {
  const { t } = useTranslation()

  return (
    <section aria-labelledby="wrap-up-today-heading" className="min-w-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {t('wrapUp.todayEyebrow')}
          </p>
          <h3 id="wrap-up-today-heading" className="mt-1 text-lg font-semibold">
            {t('wrapUp.todayHeading')}
          </h3>
        </div>
        <span className="rounded-full bg-surface-sunken px-2.5 py-1 text-xs text-muted-foreground shadow-neu-pressed">
          {t('wrapUp.openCount', { count: snapshot.openTasks.length })}
        </span>
      </div>

      <div className="mt-4 border-y border-border py-3">
        <div className="flex items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-border-strong bg-surface-elevated text-primary shadow-neu-raised-sm">
            <Sparkles className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              {t('wrapUp.essentialLabel')}
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold">
              {essentialTask?.title ?? t('wrapUp.noEssential')}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-sm font-semibold">{t('wrapUp.openHeading')}</h4>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {t('wrapUp.openDescription')}
        </p>
        <div className="mt-3 space-y-2">
          {snapshot.openTasks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
              {t('wrapUp.noOpen')}
            </p>
          ) : (
            snapshot.openTasks
              .slice(0, 6)
              .map(task => (
                <CarryOverTask
                  key={task.id}
                  task={task}
                  selected={selectedCarryOverIds.has(task.id)}
                  onToggle={() => onToggle(task.id)}
                  selectedLabel={t('wrapUp.moveSelected')}
                  unselectedLabel={t('wrapUp.moveUnselected')}
                />
              ))
          )}
        </div>
      </div>

      {snapshot.completedTasks.length > 0 ? (
        <div className="mt-5">
          <h4 className="text-sm font-semibold">
            {t('wrapUp.completedHeading')}
          </h4>
          <div className="mt-2 divide-y divide-border">
            {snapshot.completedTasks.slice(0, 4).map(task => (
              <div
                key={task.id}
                className="flex items-center gap-2 py-2 text-sm"
              >
                <CheckCircle2 className="size-4 shrink-0 text-primary" />
                <span className="truncate text-muted-foreground">
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function TomorrowPreview({
  snapshot,
  tomorrowDate,
  focusCandidates,
  tomorrowFocusId,
  onSelect,
}: {
  snapshot: WrapUpSnapshot
  tomorrowDate: string
  focusCandidates: Task[]
  tomorrowFocusId: string | null
  onSelect: (taskId: string) => void
}) {
  const { t, i18n } = useTranslation()

  return (
    <section
      aria-labelledby="wrap-up-tomorrow-heading"
      className="min-w-0 self-start rounded-2xl border border-border-strong bg-surface-elevated p-5 shadow-neu-raised"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        {t('wrapUp.tomorrowEyebrow')}
      </p>
      <h3
        id="wrap-up-tomorrow-heading"
        className="mt-1 text-lg font-semibold capitalize"
      >
        {tomorrowDate}
      </h3>

      <div className="mt-5">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <Clock3 className="size-4 text-muted-foreground" />
          {t('wrapUp.tomorrowCommitments')}
        </h4>
        <div className="mt-2 divide-y divide-border">
          {snapshot.tomorrowEvents.length === 0 ? (
            <p className="py-3 text-sm leading-5 text-muted-foreground">
              {t('wrapUp.noTomorrowCommitments')}
            </p>
          ) : (
            snapshot.tomorrowEvents.slice(0, 4).map(event => (
              <div
                key={event.id}
                className="grid grid-cols-[3.75rem_minmax(0,1fr)] gap-3 py-2.5"
              >
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {formatEventTime(event, i18n.language, t('wrapUp.allDay'))}
                </span>
                <span className="truncate text-sm font-medium">
                  {event.title}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-5">
        <h4 className="text-sm font-semibold">{t('wrapUp.tomorrowHeading')}</h4>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {t('wrapUp.tomorrowDescription')}
        </p>
        <div className="mt-3 space-y-2">
          {focusCandidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('wrapUp.noTomorrowFocus')}
            </p>
          ) : (
            focusCandidates.slice(0, 5).map(task => {
              const selected = tomorrowFocusId === task.id
              return (
                <button
                  key={task.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(task.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start outline-none transition-[background-color,border-color,box-shadow,transform] active:translate-y-px focus-visible:shadow-focus-ring motion-reduce:transform-none',
                    selected
                      ? 'border-primary/60 bg-surface text-foreground shadow-neu-raised-sm'
                      : 'border-transparent text-muted-foreground hover:border-border hover:bg-surface'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full border',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border-strong bg-surface-sunken'
                    )}
                  >
                    {selected ? <Check className="size-3.5" /> : null}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {task.title}
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}

export function WrapUpDialog() {
  const { t, i18n } = useTranslation()
  const wrapUpOpen = useUIStore(state => state.wrapUpOpen)
  const setWrapUpOpen = useUIStore(state => state.setWrapUpOpen)

  const events = useCalendarStore(state => state.events)
  const loadEventsRange = useCalendarStore(state => state.loadEventsRange)
  const tasks = useTasksStore(state => state.tasks)
  const loadTasks = useTasksStore(state => state.loadTasks)
  const updateTask = useTasksStore(state => state.updateTask)
  const habits = useHabitsStore(state => state.habits)
  const todayLogs = useHabitsStore(state => state.todayLogs)
  const loadHabits = useHabitsStore(state => state.loadHabits)
  const loadTodayLogs = useHabitsStore(state => state.loadTodayLogs)
  const todaySessions = usePomodoroStore(state => state.todaySessions)
  const loadTodaySessions = usePomodoroStore(state => state.loadTodaySessions)
  const activePlan = useDailyPlanStore(state => state.activePlan)
  const completePlan = useDailyPlanStore(state => state.completePlan)
  const initializeTodayPlan = useDailyPlanStore(
    state => state.initializeTodayPlan
  )

  const [carryOverSelection, setCarryOverSelection] = useState<
    Record<string, boolean>
  >({})
  const [preferredTomorrowFocusId, setPreferredTomorrowFocusId] = useState<
    string | null
  >(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const today = getLocalISODate()
  const tomorrow = getTomorrowISO()
  const snapshot = buildWrapUpSnapshot({
    todayISO: today,
    tomorrowISO: tomorrow,
    focusTaskId: activePlan?.focus_task_id ?? null,
    tasks,
    events,
    habits,
    habitLogs: todayLogs,
    sessions: todaySessions,
  })
  const selectedCarryOver = snapshot.openTasks.filter(
    task => carryOverSelection[task.id] !== false
  )
  const focusCandidates = buildTomorrowFocusCandidates(
    snapshot.tomorrowTasks,
    selectedCarryOver
  )
  const selectedCarryOverIds = new Set(selectedCarryOver.map(task => task.id))
  const tomorrowTaskIds = new Set(snapshot.tomorrowTasks.map(task => task.id))
  const focusCandidateIds = new Set(focusCandidates.map(task => task.id))
  const tomorrowFocusId =
    preferredTomorrowFocusId && focusCandidateIds.has(preferredTomorrowFocusId)
      ? preferredTomorrowFocusId
      : (focusCandidates[0]?.id ?? null)
  const essentialTask = tasks.find(
    task => task.id === activePlan?.focus_task_id
  )
  const essentialDone = Boolean(
    essentialTask?.completed_at || essentialTask?.status === 'done'
  )
  const bonState = getWrapUpBonState({
    completedCount: snapshot.completedTasks.length,
    essentialDone,
    habitsDone: snapshot.habitsDone,
    habitsExpected: snapshot.habitsExpected,
    openCount: snapshot.openTasks.length,
  })

  useEffect(() => {
    if (!wrapUpOpen) return
    void Promise.all([
      loadEventsRange(today, tomorrow),
      loadTasks(),
      loadHabits(),
      loadTodayLogs(),
      loadTodaySessions(),
    ])
  }, [
    loadEventsRange,
    loadHabits,
    loadTasks,
    loadTodayLogs,
    loadTodaySessions,
    today,
    tomorrow,
    wrapUpOpen,
  ])

  const toggleSelected = (taskId: string) => {
    const isSelected = carryOverSelection[taskId] !== false
    setCarryOverSelection(current => ({
      ...current,
      [taskId]: !isSelected,
    }))

    if (
      isSelected &&
      tomorrowFocusId === taskId &&
      !tomorrowTaskIds.has(taskId)
    ) {
      setPreferredTomorrowFocusId(null)
    }
  }

  const handleSubmit = (moveSelected: boolean) => {
    if (!activePlan) {
      setWrapUpOpen(false)
      return
    }

    setIsSubmitting(true)
    void persistWrapUp({
      moveSelected,
      selectedCarryOver,
      tomorrow,
      tomorrowFocusId,
      updateTask,
      completePlan,
      initializeTodayPlan,
    })
      .then(() => {
        setWrapUpOpen(false)
        void notifications.success(
          t('wrapUp.success.title'),
          t('wrapUp.success.description')
        )
      })
      .catch(() => {
        void notifications.error(
          t('wrapUp.error.title'),
          t('wrapUp.error.description')
        )
      })
      .finally(() => setIsSubmitting(false))
  }

  const tomorrowDate = formatTomorrowDate(tomorrow, i18n.language)
  const reducedMode = !activePlan

  return (
    <Dialog open={wrapUpOpen} onOpenChange={setWrapUpOpen}>
      <DialogContent className="max-h-[calc(100vh-2rem)] gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-border bg-surface-elevated px-6 py-5 pe-14">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border-strong bg-surface text-primary shadow-neu-raised-sm">
              <Moon className="size-4" />
            </span>
            <div className="space-y-1.5">
              <DialogTitle className="text-xl">{t('wrapUp.title')}</DialogTitle>
              <DialogDescription className="max-w-2xl leading-5">
                {reducedMode
                  ? t('wrapUp.reducedDescription')
                  : t('wrapUp.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(100vh-13rem)] overflow-y-auto px-6 py-5">
          <BonCompanion
            variant="wrap-up"
            state={isSubmitting ? 'drowsy' : bonState}
            message={t(`bon.wrapUp.${bonState}`)}
            messageKey={`wrap-up-${bonState}`}
          />

          <DaySummary snapshot={snapshot} />

          <div className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.9fr)]">
            <TodayReview
              snapshot={snapshot}
              essentialTask={essentialTask}
              selectedCarryOverIds={selectedCarryOverIds}
              onToggle={toggleSelected}
            />

            <TomorrowPreview
              snapshot={snapshot}
              tomorrowDate={tomorrowDate}
              focusCandidates={focusCandidates}
              tomorrowFocusId={tomorrowFocusId}
              onSelect={setPreferredTomorrowFocusId}
            />
          </div>
        </div>

        <DialogFooter className="border-t border-border bg-surface px-6 py-4 sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setWrapUpOpen(false)}
          >
            {t('wrapUp.notNow')}
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleSubmit(false)}
              disabled={isSubmitting}
            >
              {t('wrapUp.keepAsIs')}
            </Button>
            <Button
              type="button"
              onClick={() => void handleSubmit(true)}
              disabled={isSubmitting}
            >
              <MoveRight className="size-4" />
              {t('wrapUp.finish')}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
