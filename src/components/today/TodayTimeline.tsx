import {
  CalendarCheck2,
  CalendarClock,
  Check,
  CheckSquare2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CalendarEvent } from '@/lib/calendar-domain'
import { buildTodayTimeline } from '@/lib/today-domain'
import { getPriorityTagClass } from '@/lib/priority-tag-styles'
import { cn } from '@/lib/utils'
import { useCalendarStore } from '@/store/calendar-store'
import { getTodayISO, useTasksStore } from '@/store/tasks-store'
import { useUIStore } from '@/store/ui-store'

function formatEventTime(event: CalendarEvent, locale: string) {
  if (event.all_day) return null

  const start = new Date(event.start_date)
  const end = new Date(event.end_date)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null

  const formatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${formatter.format(start)} – ${formatter.format(end)}`
}

export function TodayTimeline({ events }: { events: CalendarEvent[] }) {
  const { t, i18n } = useTranslation()
  const tasks = useTasksStore(state => state.tasks)
  const toggleComplete = useTasksStore(state => state.toggleComplete)
  const setSelectedTask = useTasksStore(state => state.setSelectedTask)
  const setSelectedEvent = useCalendarStore(state => state.setSelectedEvent)
  const navigateTo = useUIStore(state => state.navigateTo)
  const timeline = buildTodayTimeline(events, tasks, getTodayISO()).slice(0, 8)

  return (
    <section aria-labelledby="today-timeline-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h2
            id="today-timeline-heading"
            className="text-xl font-semibold tracking-tight"
          >
            {t('today.timeline.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('today.timeline.description')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigateTo('calendar')}
          className="rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:shadow-focus-ring focus-visible:outline-none"
        >
          {t('today.timeline.openCalendar')}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-neu-raised">
        {timeline.length === 0 ? (
          <div className="flex items-center gap-3 px-5 py-4 text-sm text-muted-foreground">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border-strong bg-surface-elevated shadow-neu-raised-sm">
              <CalendarCheck2 className="size-4" />
            </span>
            <span>{t('today.timeline.empty')}</span>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {timeline.map(item => {
              if (item.kind === 'event') {
                const time = formatEventTime(item.event, i18n.language)
                return (
                  <button
                    key={`event-${item.event.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedEvent(item.event.id)
                      navigateTo('calendar', {
                        selectedEventId: item.event.id,
                      })
                    }}
                    className="group grid w-full grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-accent focus-visible:shadow-focus-ring focus-visible:outline-none sm:grid-cols-[6.5rem_minmax(0,1fr)_auto]"
                  >
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {time ?? t('today.timeline.allDay')}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground group-hover:text-accent-foreground">
                        {item.event.title}
                      </span>
                      <span className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarClock className="size-3" />
                        {t('today.timeline.event')}
                      </span>
                    </span>
                    <span className="size-2 rounded-full bg-info" aria-hidden />
                  </button>
                )
              }

              return (
                <div
                  key={`task-${item.task.id}`}
                  className="group grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent sm:grid-cols-[6.5rem_minmax(0,1fr)_auto]"
                >
                  <button
                    type="button"
                    onClick={() => void toggleComplete(item.task.id)}
                    aria-label={t('widgets.tasks.markCompleteAria')}
                    className="flex size-7 items-center justify-center rounded-lg border border-border-strong bg-surface text-muted-foreground shadow-neu-raised-sm transition-[background-color,color,box-shadow,transform] hover:bg-primary hover:text-primary-foreground active:translate-y-px active:shadow-neu-pressed focus-visible:shadow-focus-ring focus-visible:outline-none"
                  >
                    <Check className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTask(item.task.id)
                      navigateTo('tasks', { selectedTaskId: item.task.id })
                    }}
                    className="min-w-0 rounded-sm text-left focus-visible:shadow-focus-ring focus-visible:outline-none"
                  >
                    <span className="block truncate text-sm font-medium text-foreground group-hover:text-accent-foreground">
                      {item.task.title}
                    </span>
                    <span className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckSquare2 className="size-3" />
                      {t('today.timeline.task')}
                    </span>
                  </button>
                  <span
                    className={cn(
                      'shrink-0 tracking-wide',
                      getPriorityTagClass(item.task.priority)
                    )}
                  >
                    {t(`tasks.priority.${item.task.priority}`)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
