import { useEffect, useState } from 'react'
import {
  Check,
  CheckSquare2,
  ChevronDown,
  Maximize2,
  Minimize2,
  Play,
  RefreshCcw,
  Sparkles,
  Sunrise,
  Sunset,
  SunMedium,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { notifications } from '@/lib/notifications'
import { getDailyAxisPeriod } from '@/lib/daily-axis-banner-domain'
import { cn } from '@/lib/utils'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { usePomodoroStore } from '@/store/pomodoro-store'
import { useTasksStore, type Task } from '@/store/tasks-store'
import { useUIStore } from '@/store/ui-store'

function greetingKey(period: ReturnType<typeof getDailyAxisPeriod>) {
  if (period === 'morning') return 'dailyAxis.goodMorning'
  if (period === 'afternoon') return 'dailyAxis.goodAfternoon'
  return 'dailyAxis.goodEvening'
}

function getPrimaryLabel(
  t: TFunction,
  period: ReturnType<typeof getDailyAxisPeriod>,
  empty: boolean,
  running: boolean
) {
  if (period === 'evening') return t('dailyAxis.prepareTomorrow')
  if (empty) return t('dailyAxis.openTasks')
  if (running) return t('dailyAxis.openFocus')
  return t('dailyAxis.startFocus')
}

function createDailyAxisActions({
  t,
  period,
  availableTasks,
  focusedTask,
  running,
  timerState,
  linkedTaskId,
  updateFocus,
  linkTask,
  startContextualFocus,
  navigateTo,
  setWrapUpOpen,
  closeSelector,
}: {
  t: TFunction
  period: ReturnType<typeof getDailyAxisPeriod>
  availableTasks: Task[]
  focusedTask: Task | null
  running: boolean
  timerState: string
  linkedTaskId: string | null
  updateFocus: (taskId: string, source: 'manual') => Promise<unknown>
  linkTask: (taskId: string) => void
  startContextualFocus: (taskId: string) => Promise<boolean>
  navigateTo: (page: 'tasks' | 'focus') => void
  setWrapUpOpen: (open: boolean) => void
  closeSelector: () => void
}) {
  const selectFocus = async (taskId: string) => {
    if (!taskId || focusedTask?.id === taskId) {
      closeSelector()
      return
    }

    try {
      const nextTask = availableTasks.find(task => task.id === taskId)
      await updateFocus(taskId, 'manual')
      closeSelector()
      void notifications.success(
        t('dailyAxis.success.focusUpdated'),
        nextTask?.title
      )
    } catch {
      void notifications.error(
        t('dailyAxis.error.loadFailed'),
        t('dailyAxis.error.focusUpdateFailed')
      )
    }
  }

  const startFocus = async () => {
    if (!focusedTask) {
      navigateTo('tasks')
      return
    }

    linkTask(focusedTask.id)
    navigateTo('focus')
    if (timerState !== 'running' || linkedTaskId !== focusedTask.id) {
      const started = await startContextualFocus(focusedTask.id)
      if (!started) {
        void notifications.error(
          t('dailyAxis.error.startFailed'),
          t('dailyAxis.error.startPreserved')
        )
        return
      }
    }
    void notifications.success(
      t('dailyAxis.success.focusStarted'),
      focusedTask.title
    )
  }

  const runPrimaryAction = () => {
    if (period === 'evening') {
      setWrapUpOpen(true)
      return
    }
    if (running) {
      navigateTo('focus')
      return
    }
    void startFocus()
  }

  return { runPrimaryAction, selectFocus, startFocus }
}

function PeriodIcon({
  period,
}: {
  period: ReturnType<typeof getDailyAxisPeriod>
}) {
  if (period === 'morning') return <Sunrise className="size-3.5" />
  if (period === 'afternoon') return <SunMedium className="size-3.5" />
  return <Sunset className="size-3.5" />
}

function DailyAxisSummary({
  period,
  isLoading,
  hasError,
  empty,
  focusedTask,
  running,
}: {
  period: ReturnType<typeof getDailyAxisPeriod>
  isLoading: boolean
  hasError: boolean
  empty: boolean
  focusedTask: Task | null
  running: boolean
}) {
  const { t } = useTranslation()

  let content = (
    <div className="space-y-1.5">
      <h2 className="text-base font-semibold tracking-tight">
        {t('dailyAxis.title')}
      </h2>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1">
          <CheckSquare2 className="size-3.5" />
          <span className="truncate">{focusedTask?.title}</span>
        </span>
        {running ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3" />
            {t('dailyAxis.inProgress')}
          </span>
        ) : null}
        {focusedTask?.priority ? (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs uppercase tracking-wide">
            {t(`tasks.priority.${focusedTask.priority}`)}
          </span>
        ) : null}
      </div>
    </div>
  )

  if (empty) {
    content = (
      <div className="space-y-2">
        <h2 className="text-base font-semibold tracking-tight">
          {t('dailyAxis.emptyTitle')}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t('dailyAxis.emptyDescription')}
        </p>
      </div>
    )
  }
  if (hasError) {
    content = (
      <div className="space-y-2">
        <h2 className="text-base font-semibold tracking-tight">
          {t('dailyAxis.errorTitle')}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t('dailyAxis.error.loadFailed')}
        </p>
      </div>
    )
  }
  if (isLoading) {
    content = (
      <div className="space-y-2">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-1.5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <PeriodIcon period={period} />
        <span>{t(greetingKey(period))}</span>
      </div>
      {content}
    </div>
  )
}

function FocusSelector({
  open,
  onOpenChange,
  tasks,
  focusedTaskId,
  disabled,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tasks: Task[]
  focusedTaskId?: string
  disabled: boolean
  onSelect: (taskId: string) => void
}) {
  const { t } = useTranslation()

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg"
          disabled={disabled}
        >
          <RefreshCcw className="size-4" />
          <span>{t('dailyAxis.changeFocus')}</span>
          <ChevronDown className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-2">
        <div className="mb-1 px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('dailyAxis.selectorTitle')}
        </div>
        <div className="space-y-1">
          {tasks.map(task => {
            const selected = task.id === focusedTaskId
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onSelect(task.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
                  selected && 'bg-accent'
                )}
              >
                <span className="flex-1 truncate">{task.title}</span>
                {selected ? <Check className="size-4 text-primary" /> : null}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function MinimizedDailyAxis({ onRestore }: { onRestore: () => void }) {
  const { t } = useTranslation()

  return (
    <section
      aria-label="Daily Axis"
      className="pointer-events-none fixed bottom-5 right-5 z-50"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="pointer-events-auto rounded-xl bg-surface-elevated shadow-modal"
        onClick={onRestore}
        title={t('dailyAxis.restore')}
      >
        <Maximize2 className="size-3.5" />
        <span>{t('dailyAxis.title')}</span>
      </Button>
    </section>
  )
}

export function DailyAxisBanner() {
  const { t } = useTranslation()
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)

  const tasks = useTasksStore(state => state.tasks)
  const tasksLoading = useTasksStore(state => state.isLoading)
  const loadTasks = useTasksStore(state => state.loadTasks)

  const activePlan = useDailyPlanStore(state => state.activePlan)
  const planLoading = useDailyPlanStore(state => state.isLoading)
  const planSaving = useDailyPlanStore(state => state.isSaving)
  const planError = useDailyPlanStore(state => state.error)
  const updateFocus = useDailyPlanStore(state => state.updateFocus)

  const linkTask = usePomodoroStore(state => state.linkTask)
  const startContextualFocus = usePomodoroStore(
    state => state.startContextualFocus
  )
  const timerState = usePomodoroStore(state => state.timerState)
  const linkedTaskId = usePomodoroStore(state => state.linkedTaskId)

  const navigateTo = useUIStore(state => state.navigateTo)
  const setWrapUpOpen = useUIStore(state => state.setWrapUpOpen)

  const period = getDailyAxisPeriod()

  useEffect(() => {
    if (tasks.length === 0 && !tasksLoading) {
      void loadTasks()
    }
  }, [loadTasks, tasks.length, tasksLoading])

  const availableFocusTasks = tasks.filter(
    task => task.status !== 'done' && !task.completed_at
  )
  const focusedTask = activePlan?.focus_task_id
    ? (availableFocusTasks.find(task => task.id === activePlan.focus_task_id) ??
      null)
    : null
  const selectableTasks = availableFocusTasks.slice(0, 5)
  const isRunningFocusedTask =
    timerState === 'running' && !!focusedTask && linkedTaskId === focusedTask.id
  const isLoading = planLoading || tasksLoading
  const emptyState = !isLoading && !focusedTask

  const primaryLabel = getPrimaryLabel(
    t,
    period,
    emptyState,
    isRunningFocusedTask
  )
  const actions = createDailyAxisActions({
    t,
    period,
    availableTasks: availableFocusTasks,
    focusedTask,
    running: isRunningFocusedTask,
    timerState,
    linkedTaskId,
    updateFocus,
    linkTask,
    startContextualFocus,
    navigateTo,
    setWrapUpOpen,
    closeSelector: () => setSelectorOpen(false),
  })

  if (minimized) {
    return <MinimizedDailyAxis onRestore={() => setMinimized(false)} />
  }

  return (
    <section
      aria-label="Daily Axis"
      className="pointer-events-none fixed bottom-5 right-5 z-50 w-[min(390px,calc(100vw-7rem))]"
    >
      <div className="pointer-events-auto relative overflow-hidden rounded-xl border border-border-strong bg-surface-elevated px-4 py-3 shadow-modal">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-2 top-2 rounded-lg text-muted-foreground"
          onClick={() => setMinimized(true)}
          title={t('dailyAxis.minimize')}
        >
          <Minimize2 className="size-4" />
        </Button>

        <div className="flex flex-col gap-3 pr-8">
          <DailyAxisSummary
            period={period}
            isLoading={isLoading}
            hasError={Boolean(planError)}
            empty={emptyState}
            focusedTask={focusedTask}
            running={isRunningFocusedTask}
          />

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <FocusSelector
              open={selectorOpen}
              onOpenChange={setSelectorOpen}
              tasks={selectableTasks}
              focusedTaskId={focusedTask?.id}
              disabled={isLoading || planSaving || selectableTasks.length <= 1}
              onSelect={taskId => void actions.selectFocus(taskId)}
            />

            {period === 'evening' && !emptyState ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                disabled={isLoading || planSaving}
                onClick={() => void actions.startFocus()}
              >
                <Play className="size-4" />
                <span>{t('dailyAxis.startFocus')}</span>
              </Button>
            ) : null}

            <Button
              type="button"
              size="sm"
              className="rounded-lg"
              disabled={isLoading || planSaving}
              onClick={actions.runPrimaryAction}
            >
              <Play className="size-4" />
              <span>{primaryLabel}</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
