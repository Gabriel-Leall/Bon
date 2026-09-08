import { useState } from 'react'
import { CalendarClock, Check, ChevronDown, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CalendarEvent } from '@/lib/calendar-domain'
import { notifications } from '@/lib/notifications'
import { selectTodayOpenTasks } from '@/lib/today-domain'
import { cn } from '@/lib/utils'
import { useCalendarStore } from '@/store/calendar-store'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { usePomodoroStore } from '@/store/pomodoro-store'
import { getTodayISO, useTasksStore } from '@/store/tasks-store'
import { useUIStore } from '@/store/ui-store'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

function formatCommitmentTime(event: CalendarEvent, locale: string) {
  if (event.all_day) return null

  const start = new Date(event.start_date)
  if (Number.isNaN(start.getTime())) return null

  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(start)
}

export function TodayNow({
  nextCommitment,
}: {
  nextCommitment: CalendarEvent | null
}) {
  const { t, i18n } = useTranslation()
  const [selectorOpen, setSelectorOpen] = useState(false)
  const tasks = useTasksStore(state => state.tasks)
  const activePlan = useDailyPlanStore(state => state.activePlan)
  const updateFocus = useDailyPlanStore(state => state.updateFocus)
  const planSaving = useDailyPlanStore(state => state.isSaving)
  const timerState = usePomodoroStore(state => state.timerState)
  const startContextualFocus = usePomodoroStore(
    state => state.startContextualFocus
  )
  const unlinkTask = usePomodoroStore(state => state.unlinkTask)
  const setSelectedEvent = useCalendarStore(state => state.setSelectedEvent)
  const navigateTo = useUIStore(state => state.navigateTo)

  const openTasks = selectTodayOpenTasks(tasks, getTodayISO())
  const focusedTask =
    openTasks.find(task => task.id === activePlan?.focus_task_id) ??
    openTasks[0] ??
    null
  const selectableTasks = openTasks.slice(0, 6)
  const focusIsRunning = timerState === 'running'
  const commitmentTime = nextCommitment
    ? formatCommitmentTime(nextCommitment, i18n.language)
    : null

  const handleSelectFocus = async (taskId: string) => {
    try {
      await updateFocus(taskId, 'manual')
      setSelectorOpen(false)
    } catch {
      void notifications.error(
        t('dailyAxis.error.loadFailed'),
        t('dailyAxis.error.focusUpdateFailed')
      )
    }
  }

  const handleFocus = async () => {
    if (focusIsRunning) {
      navigateTo('focus')
      return
    }

    if (!focusedTask) unlinkTask()
    const started = await startContextualFocus(focusedTask?.id ?? null)
    if (!started) {
      void notifications.error(
        t('dailyAxis.error.startFailed'),
        t('dailyAxis.error.startPreserved')
      )
      return
    }

    navigateTo('focus')
  }

  const openCommitment = () => {
    if (!nextCommitment) {
      navigateTo('calendar')
      return
    }

    setSelectedEvent(nextCommitment.id)
    navigateTo('calendar', { selectedEventId: nextCommitment.id })
  }

  return (
    <section
      aria-labelledby="today-now-heading"
      className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-neu-raised"
    >
      <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <div className="flex min-w-0 flex-col justify-between gap-6 p-6 sm:p-7">
          <div className="space-y-3">
            <h1
              id="today-now-heading"
              className="max-w-2xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            >
              {focusedTask?.title ?? t('today.now.neutralAction')}
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              {focusedTask
                ? t('today.now.actionDescription')
                : t('today.now.neutralDescription')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              size="lg"
              onClick={() => void handleFocus()}
              className="rounded-xl px-5"
            >
              <Play className="size-4" fill="currentColor" />
              {focusIsRunning
                ? t('today.now.openFocus')
                : t('today.now.startFocus')}
            </Button>

            {selectableTasks.length > 1 ? (
              <Popover open={selectorOpen} onOpenChange={setSelectorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="rounded-xl"
                    disabled={planSaving}
                  >
                    {t('today.now.changeAction')}
                    <ChevronDown className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-80 p-2">
                  <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {t('today.now.chooseAction')}
                  </p>
                  <div className="space-y-1">
                    {selectableTasks.map(task => {
                      const selected = task.id === focusedTask?.id
                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => void handleSelectFocus(task.id)}
                          className={cn(
                            'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-[background-color,color,box-shadow] hover:bg-accent focus-visible:shadow-focus-ring focus-visible:outline-none',
                            selected && 'bg-accent text-accent-foreground'
                          )}
                        >
                          <span className="flex-1 truncate">{task.title}</span>
                          {selected ? <Check className="size-4" /> : null}
                        </button>
                      )
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={openCommitment}
          className={cn(
            'group flex min-w-0 flex-col border-t border-border bg-surface-elevated p-6 text-left transition-[background-color,color] hover:bg-accent focus-visible:shadow-focus-ring focus-visible:outline-none lg:border-l lg:border-t-0 sm:p-7',
            nextCommitment ? 'justify-between gap-7' : 'justify-center gap-3'
          )}
        >
          <span className="flex items-center justify-between gap-3 text-sm font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <CalendarClock className="size-4" />
              {t('today.now.nextCommitment')}
            </span>
            {commitmentTime ? (
              <span className="font-mono text-xs tabular-nums text-foreground">
                {commitmentTime}
              </span>
            ) : null}
          </span>

          <span className="space-y-2">
            <span className="block text-xl font-semibold tracking-tight text-foreground group-hover:text-accent-foreground">
              {nextCommitment?.title ?? t('today.now.noCommitment')}
            </span>
            <span className="block text-sm leading-6 text-muted-foreground">
              {nextCommitment?.all_day
                ? t('today.timeline.allDay')
                : nextCommitment
                  ? t('today.now.commitmentHint')
                  : t('today.now.calendarHint')}
            </span>
          </span>
        </button>
      </div>
    </section>
  )
}
