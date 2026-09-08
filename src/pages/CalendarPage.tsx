import { useEffect, useState } from 'react'
import {
  CalendarDays,
  CheckSquare2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { SegmentedControl } from '@/components/ui/segmented-control'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  getEventsForDate,
  getLocalISODate,
  type CalendarEvent,
} from '@/lib/calendar-domain'
import {
  CALENDAR_TIMELINE_END_HOUR,
  CALENDAR_TIMELINE_START_HOUR,
  CALENDAR_VIEW_STORAGE_KEY,
  getCalendarRange,
  getDisplayedAllDayEnd,
  getDurationMinutes,
  getMinutesIntoDay,
  getMonthDays,
  getStoredAllDayEnd,
  getWeekDays,
  parseISODate,
  readStoredCalendarView,
  shiftCalendarAnchor,
  toDateTimeLocalValue,
  toStoredDateTime,
  type CalendarDateCell,
  type CalendarView,
} from '@/lib/calendar-page-domain'
import { notifications } from '@/lib/notifications'
import { cn } from '@/lib/utils'
import { useCalendarStore } from '@/store/calendar-store'
import { type Task, useTasksStore } from '@/store/tasks-store'
import { useUIStore } from '@/store/ui-store'

type ComposerKind = 'event' | 'task'

type CalendarItem =
  | { kind: 'event'; id: string; title: string; event: CalendarEvent }
  | { kind: 'task'; id: string; title: string; task: Task }

const TIMELINE_HOUR_HEIGHT = 38
const timelineHours = Array.from(
  { length: CALENDAR_TIMELINE_END_HOUR - CALENDAR_TIMELINE_START_HOUR },
  (_, index) => CALENDAR_TIMELINE_START_HOUR + index
)
const dateFormatters = new Map<string, Intl.DateTimeFormat>()
const timeFormatters = new Map<string, Intl.DateTimeFormat>()

function getEventDateISO(event: CalendarEvent) {
  if (event.all_day) return event.start_date.slice(0, 10)
  return getLocalISODate(new Date(event.start_date))
}

function getItemsForDate(
  dateISO: string,
  events: CalendarEvent[],
  tasks: Task[]
): CalendarItem[] {
  const eventItems: CalendarItem[] = getEventsForDate(events, dateISO)
    .sort((first, second) => first.start_date.localeCompare(second.start_date))
    .map(event => ({
      kind: 'event',
      id: event.id,
      title: event.title,
      event,
    }))

  const taskItems: CalendarItem[] = tasks
    .filter(task => task.due_date === dateISO && task.status !== 'done')
    .map(task => ({
      kind: 'task',
      id: task.id,
      title: task.title,
      task,
    }))

  return [...eventItems, ...taskItems]
}

function formatDate(
  value: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions
) {
  const key = `${locale}:${JSON.stringify(options)}`
  let formatter = dateFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options)
    dateFormatters.set(key, formatter)
  }
  return formatter.format(value)
}

function formatEventTime(event: CalendarEvent, locale: string) {
  if (event.all_day) return null

  let formatter = timeFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    })
    timeFormatters.set(locale, formatter)
  }
  return `${formatter.format(new Date(event.start_date))}–${formatter.format(new Date(event.end_date))}`
}

function CalendarItemIcon({ kind }: { kind: CalendarItem['kind'] }) {
  return kind === 'event' ? (
    <CalendarDays className="size-3.5" aria-hidden="true" />
  ) : (
    <CheckSquare2 className="size-3.5" aria-hidden="true" />
  )
}

function CalendarItemButton({
  item,
  locale,
  onOpen,
  compact = false,
}: {
  item: CalendarItem
  locale: string
  onOpen: () => void
  compact?: boolean
}) {
  const { t } = useTranslation()
  const time =
    item.kind === 'event' ? formatEventTime(item.event, locale) : null

  return (
    <button
      type="button"
      onClick={event => {
        event.stopPropagation()
        onOpen()
      }}
      className={cn(
        'flex w-full min-w-0 items-center gap-2 rounded-lg border border-border bg-surface-elevated text-start text-foreground shadow-neu-raised-sm outline-none transition-[background-color,border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-border-strong active:translate-y-px active:shadow-neu-pressed focus-visible:shadow-focus-ring motion-reduce:transform-none',
        compact ? 'px-2 py-1 text-xs' : 'px-3 py-2.5 text-sm'
      )}
      aria-label={
        item.kind === 'event'
          ? t('calendar.item.openEvent', { title: item.title })
          : t('calendar.item.openTask', { title: item.title })
      }
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center',
          item.kind === 'event' ? 'text-primary' : 'text-warning'
        )}
      >
        <CalendarItemIcon kind={item.kind} />
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{item.title}</span>
      {time && !compact ? (
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {time}
        </span>
      ) : null}
    </button>
  )
}

function SelectedDayRail({
  dateISO,
  items,
  locale,
  onAdd,
  onOpenItem,
}: {
  dateISO: string
  items: CalendarItem[]
  locale: string
  onAdd: () => void
  onOpenItem: (item: CalendarItem) => void
}) {
  const { t } = useTranslation()
  const date = parseISODate(dateISO)

  return (
    <aside className="flex min-h-0 flex-col border-b border-border bg-surface-elevated p-5 xl:border-b-0 xl:border-e">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {t('calendar.selectedDay')}
        </p>
        <h2 className="mt-2 text-xl font-semibold capitalize tracking-tight text-foreground">
          {formatDate(date, locale, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('calendar.itemCount', { count: items.length })}
        </p>
      </div>

      <Button type="button" className="mt-5 w-full" onClick={onAdd}>
        <Plus className="size-4" />
        {t('calendar.addForDay')}
      </Button>

      <div className="mt-5 min-h-0 space-y-2 overflow-y-auto pe-1">
        {items.length > 0 ? (
          items.map(item => (
            <CalendarItemButton
              key={`${item.kind}-${item.id}`}
              item={item}
              locale={locale}
              onOpen={() => onOpenItem(item)}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-border bg-surface-sunken px-4 py-5 shadow-neu-pressed">
            <Clock3 className="size-5 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">
              {t('calendar.emptyDay.title')}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {t('calendar.emptyDay.description')}
            </p>
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5 text-primary" />
          {t('calendar.types.event')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckSquare2 className="size-3.5 text-warning" />
          {t('calendar.types.task')}
        </span>
      </div>
    </aside>
  )
}

function CalendarToolbar({
  label,
  view,
  onViewChange,
  onToday,
  onPrevious,
  onNext,
}: {
  label: string
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  onToday: () => void
  onPrevious: () => void
  onNext: () => void
}) {
  const { t } = useTranslation()
  const viewOptions = [
    { value: 'week', label: t('calendar.views.week') },
    { value: 'month', label: t('calendar.views.month') },
  ]

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface px-5 py-4 shadow-neu-raised-sm">
      <h2 className="text-lg font-semibold capitalize tracking-tight text-foreground">
        {label}
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onToday}>
          {t('calendar.today')}
        </Button>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onPrevious}
            aria-label={t('calendar.previous')}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onNext}
            aria-label={t('calendar.next')}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <SegmentedControl
          value={view}
          onValueChange={value => onViewChange(value as CalendarView)}
          options={viewOptions}
          aria-label={t('calendar.views.label')}
        />
      </div>
    </div>
  )
}

function MonthCalendar({
  days,
  selectedDate,
  todayISO,
  events,
  tasks,
  locale,
  onCreate,
  onOpenItem,
}: {
  days: CalendarDateCell[]
  selectedDate: string
  todayISO: string
  events: CalendarEvent[]
  tasks: Task[]
  locale: string
  onCreate: (dateISO: string) => void
  onOpenItem: (item: CalendarItem) => void
}) {
  const { t } = useTranslation()

  return (
    <div className="min-w-[700px]">
      <div className="grid grid-cols-7 border-b border-border bg-surface-elevated">
        {days.slice(0, 7).map(day => (
          <div
            key={`weekday-${day.dateISO}`}
            className="px-3 py-3 text-center text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
          >
            {formatDate(day.date, locale, { weekday: 'short' })}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-6">
        {days.map(day => {
          const items = getItemsForDate(day.dateISO, events, tasks)
          const visibleItems = items.slice(0, 3)
          const selected = selectedDate === day.dateISO
          const today = todayISO === day.dateISO

          return (
            <div
              key={day.dateISO}
              className={cn(
                'relative min-h-28 border-b border-e border-border p-2.5 transition-colors',
                !day.inCurrentMonth && 'bg-surface-sunken/45',
                selected && 'bg-accent/35'
              )}
            >
              <button
                type="button"
                onClick={() => onCreate(day.dateISO)}
                className="absolute inset-0 z-0 outline-none focus-visible:shadow-focus-input"
                aria-label={t('calendar.createForDate', {
                  date: formatDate(day.date, locale, { dateStyle: 'long' }),
                })}
              />
              <div className="pointer-events-none relative z-10 flex items-center justify-between">
                <span
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full text-xs font-medium tabular-nums text-foreground',
                    today &&
                      'bg-primary text-primary-foreground shadow-neu-raised-sm',
                    !day.inCurrentMonth && !today && 'text-foreground-disabled'
                  )}
                >
                  {day.date.getDate()}
                </span>
              </div>
              <div className="relative z-10 mt-2 space-y-1.5">
                {visibleItems.map(item => (
                  <div key={`${item.kind}-${item.id}`}>
                    <CalendarItemButton
                      item={item}
                      locale={locale}
                      onOpen={() => onOpenItem(item)}
                      compact
                    />
                  </div>
                ))}
                {items.length > visibleItems.length ? (
                  <span className="pointer-events-none block px-1 text-[11px] text-muted-foreground">
                    {t('calendar.moreItems', {
                      count: items.length - visibleItems.length,
                    })}
                  </span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WeekCalendar({
  days,
  selectedDate,
  todayISO,
  events,
  tasks,
  locale,
  onCreateAllDay,
  onCreateAtTime,
  onOpenItem,
}: {
  days: CalendarDateCell[]
  selectedDate: string
  todayISO: string
  events: CalendarEvent[]
  tasks: Task[]
  locale: string
  onCreateAllDay: (dateISO: string) => void
  onCreateAtTime: (dateISO: string, hour: number) => void
  onOpenItem: (item: CalendarItem) => void
}) {
  const { t } = useTranslation()
  const timelineHeight = timelineHours.length * TIMELINE_HOUR_HEIGHT

  return (
    <div className="min-w-[820px]">
      <div className="grid grid-cols-[4.5rem_repeat(7,minmax(6.75rem,1fr))] border-b border-border bg-surface-elevated">
        <div className="border-e border-border" />
        {days.map(day => {
          const selected = day.dateISO === selectedDate
          const today = day.dateISO === todayISO
          return (
            <button
              key={day.dateISO}
              type="button"
              onClick={() => onCreateAllDay(day.dateISO)}
              className={cn(
                'flex min-h-18 flex-col items-center justify-center border-e border-border px-2 py-3 outline-none transition-colors hover:bg-accent/45 focus-visible:shadow-focus-input',
                selected && 'bg-accent/45'
              )}
              aria-label={t('calendar.createForDate', {
                date: formatDate(day.date, locale, { dateStyle: 'long' }),
              })}
            >
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {formatDate(day.date, locale, { weekday: 'short' })}
              </span>
              <span
                className={cn(
                  'mt-1 flex size-8 items-center justify-center rounded-full text-sm font-semibold tabular-nums text-foreground',
                  today &&
                    'bg-primary text-primary-foreground shadow-neu-raised-sm'
                )}
              >
                {day.date.getDate()}
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-[4.5rem_repeat(7,minmax(6.75rem,1fr))] border-b border-border bg-surface">
        <div className="flex items-start justify-end border-e border-border px-2 py-2 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          {t('calendar.allDayShort')}
        </div>
        {days.map(day => {
          const items = getItemsForDate(day.dateISO, events, tasks).filter(
            item => item.kind === 'task' || item.event.all_day
          )
          return (
            <div
              key={`all-day-${day.dateISO}`}
              className="min-h-16 space-y-1 border-e border-border p-1.5"
            >
              {items.slice(0, 2).map(item => (
                <CalendarItemButton
                  key={`${item.kind}-${item.id}`}
                  item={item}
                  locale={locale}
                  onOpen={() => onOpenItem(item)}
                  compact
                />
              ))}
              {items.length > 2 ? (
                <span className="block px-1 text-[10px] text-muted-foreground">
                  {t('calendar.moreItems', { count: items.length - 2 })}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-[4.5rem_repeat(7,minmax(6.75rem,1fr))] bg-surface">
        <div
          className="relative border-e border-border"
          style={{ height: timelineHeight }}
        >
          {timelineHours.map(hour => (
            <span
              key={hour}
              className="absolute end-2 -translate-y-1/2 text-[10px] tabular-nums text-muted-foreground"
              style={{
                top:
                  (hour - CALENDAR_TIMELINE_START_HOUR) * TIMELINE_HOUR_HEIGHT,
              }}
            >
              {String(hour).padStart(2, '0')}:00
            </span>
          ))}
        </div>

        {days.map(day => {
          const timedEvents = getEventsForDate(events, day.dateISO).filter(
            event => !event.all_day
          )
          return (
            <div
              key={`timeline-${day.dateISO}`}
              className="relative border-e border-border"
              style={{ height: timelineHeight }}
            >
              {timelineHours.map(hour => (
                <button
                  key={hour}
                  type="button"
                  onClick={() => onCreateAtTime(day.dateISO, hour)}
                  aria-label={t('calendar.createAtTime', {
                    date: formatDate(day.date, locale, { dateStyle: 'long' }),
                    time: `${String(hour).padStart(2, '0')}:00`,
                  })}
                  className="absolute inset-x-0 border-t border-border/75 outline-none transition-colors hover:bg-accent/35 focus-visible:bg-accent/45 focus-visible:shadow-focus-input"
                  style={{
                    top:
                      (hour - CALENDAR_TIMELINE_START_HOUR) *
                      TIMELINE_HOUR_HEIGHT,
                    height: TIMELINE_HOUR_HEIGHT,
                  }}
                />
              ))}

              {timedEvents.map(event => {
                const unclampedTop =
                  ((getMinutesIntoDay(event.start_date) -
                    CALENDAR_TIMELINE_START_HOUR * 60) /
                    60) *
                  TIMELINE_HOUR_HEIGHT
                const top = Math.max(
                  3,
                  Math.min(timelineHeight - 34, unclampedTop + 3)
                )
                const height = Math.min(
                  timelineHeight - top - 3,
                  Math.max(
                    32,
                    (getDurationMinutes(event.start_date, event.end_date) /
                      60) *
                      TIMELINE_HOUR_HEIGHT -
                      6
                  )
                )
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() =>
                      onOpenItem({
                        kind: 'event',
                        id: event.id,
                        title: event.title,
                        event,
                      })
                    }
                    className="absolute inset-x-1 z-10 overflow-hidden rounded-lg border border-primary/35 bg-surface-elevated px-2 py-1 text-start text-[11px] text-foreground shadow-neu-raised-sm outline-none transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/65 focus-visible:shadow-focus-ring motion-reduce:transform-none"
                    style={{ top, height }}
                    aria-label={t('calendar.item.openEvent', {
                      title: event.title,
                    })}
                  >
                    <span className="block truncate font-semibold">
                      {event.title}
                    </span>
                    <span className="mt-0.5 block truncate tabular-nums text-muted-foreground">
                      {formatEventTime(event, locale)}
                    </span>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function CalendarPage() {
  const { t, i18n } = useTranslation()
  const events = useCalendarStore(state => state.events)
  const isLoading = useCalendarStore(state => state.isLoading)
  const loadEventsRange = useCalendarStore(state => state.loadEventsRange)
  const createEvent = useCalendarStore(state => state.createEvent)
  const updateEvent = useCalendarStore(state => state.updateEvent)
  const deleteEvent = useCalendarStore(state => state.deleteEvent)
  const tasks = useTasksStore(state => state.tasks)
  const loadTasks = useTasksStore(state => state.loadTasks)
  const addTask = useTasksStore(state => state.addTask)
  const navigateTo = useUIStore(state => state.navigateTo)

  const today = new Date()
  const todayISO = getLocalISODate(today)
  const weekStartsOn: 0 | 1 = i18n.language.startsWith('pt') ? 1 : 0
  const [view, setView] = useState<CalendarView>(() =>
    readStoredCalendarView(window.localStorage)
  )
  const [currentDate, setCurrentDate] = useState(today)
  const [selectedDate, setSelectedDate] = useState(todayISO)
  const [composerOpen, setComposerOpen] = useState(false)
  const [composerKind, setComposerKind] = useState<ComposerKind>('event')
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startValue, setStartValue] = useState(todayISO)
  const [endValue, setEndValue] = useState(todayISO)
  const [allDay, setAllDay] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const visibleDays =
    view === 'week'
      ? getWeekDays(currentDate, weekStartsOn)
      : getMonthDays(currentDate, weekStartsOn)
  const selectedItems = getItemsForDate(selectedDate, events, tasks)
  const periodLabel =
    view === 'month'
      ? formatDate(currentDate, i18n.language, {
          month: 'long',
          year: 'numeric',
        })
      : `${formatDate(visibleDays[0]?.date ?? currentDate, i18n.language, {
          day: 'numeric',
          month: 'short',
        })} — ${formatDate(
          visibleDays.at(-1)?.date ?? currentDate,
          i18n.language,
          {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }
        )}`

  useEffect(() => {
    const range = getCalendarRange(currentDate, view, weekStartsOn)
    void loadEventsRange(range.start, range.end)
  }, [currentDate, loadEventsRange, view, weekStartsOn])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  useEffect(() => {
    window.localStorage.setItem(CALENDAR_VIEW_STORAGE_KEY, view)
  }, [view])

  const resetComposer = () => {
    setComposerKind('event')
    setEditingEvent(null)
    setTitle('')
    setDescription('')
    setStartValue(selectedDate)
    setEndValue(selectedDate)
    setAllDay(true)
    setIsSaving(false)
  }

  const openAllDayComposer = (dateISO: string) => {
    setSelectedDate(dateISO)
    setComposerKind('event')
    setEditingEvent(null)
    setTitle('')
    setDescription('')
    setStartValue(dateISO)
    setEndValue(dateISO)
    setAllDay(true)
    setComposerOpen(true)
  }

  const openTimedComposer = (dateISO: string, hour: number) => {
    const start = new Date(`${dateISO}T${String(hour).padStart(2, '0')}:00:00`)
    const end = new Date(start.getTime() + 60 * 60 * 1000)
    setSelectedDate(dateISO)
    setComposerKind('event')
    setEditingEvent(null)
    setTitle('')
    setDescription('')
    setStartValue(toDateTimeLocalValue(start.toISOString()))
    setEndValue(toDateTimeLocalValue(end.toISOString()))
    setAllDay(false)
    setComposerOpen(true)
  }

  const openEvent = (event: CalendarEvent) => {
    setSelectedDate(getEventDateISO(event))
    setComposerKind('event')
    setEditingEvent(event)
    setTitle(event.title)
    setDescription(event.description ?? '')
    setAllDay(event.all_day)
    if (event.all_day) {
      setStartValue(event.start_date.slice(0, 10))
      setEndValue(
        event.end_date > event.start_date
          ? getDisplayedAllDayEnd(event.end_date.slice(0, 10))
          : event.start_date.slice(0, 10)
      )
    } else {
      setStartValue(toDateTimeLocalValue(event.start_date))
      setEndValue(toDateTimeLocalValue(event.end_date))
    }
    setComposerOpen(true)
  }

  const openItem = (item: CalendarItem) => {
    if (item.kind === 'event') {
      openEvent(item.event)
      return
    }
    navigateTo('tasks', { selectedTaskId: item.task.id })
  }

  const handleViewChange = (nextView: CalendarView) => {
    setCurrentDate(parseISODate(selectedDate))
    setView(nextView)
  }

  const movePeriod = (direction: -1 | 1) => {
    const nextDate = shiftCalendarAnchor(currentDate, view, direction)
    setCurrentDate(nextDate)
    setSelectedDate(getLocalISODate(nextDate))
  }

  const returnToToday = () => {
    const now = new Date()
    setCurrentDate(now)
    setSelectedDate(getLocalISODate(now))
  }

  const startDate = startValue.slice(0, 10)
  const endDate = endValue.slice(0, 10)
  const rangeIsInvalid =
    composerKind === 'event' &&
    startValue.length > 0 &&
    endValue.length > 0 &&
    (allDay
      ? endDate < startDate
      : new Date(endValue).getTime() <= new Date(startValue).getTime())
  const composerIsValid =
    title.trim().length > 0 &&
    startValue.length > 0 &&
    (composerKind === 'task' || (endValue.length > 0 && !rangeIsInvalid))

  const handleSave = async () => {
    if (!composerIsValid) return
    setIsSaving(true)

    try {
      if (composerKind === 'task') {
        await addTask(title, {
          due_date: startDate,
          description: description.trim() || undefined,
        })
      } else {
        const start = allDay ? startDate : toStoredDateTime(startValue)
        const end = allDay
          ? getStoredAllDayEnd(endDate)
          : toStoredDateTime(endValue)

        if (editingEvent) {
          await updateEvent({
            id: editingEvent.id,
            title: title.trim(),
            description: description.trim() || undefined,
            start_date: start,
            end_date: end,
            all_day: allDay,
            color: editingEvent.color ?? undefined,
            updated_at: new Date().toISOString(),
          })
        } else {
          await createEvent({
            title: title.trim(),
            description: description.trim() || undefined,
            start_date: start,
            end_date: end,
            all_day: allDay,
            color: undefined,
          })
        }
      }

      setSelectedDate(startDate)
      setComposerOpen(false)
      resetComposer()
    } catch {
      setIsSaving(false)
      void notifications.error(
        t('calendar.feedback.saveFailed'),
        t('calendar.feedback.tryAgain')
      )
    }
  }

  const handleDelete = async () => {
    if (!editingEvent) return
    setIsSaving(true)
    try {
      await deleteEvent(editingEvent.id)
      setComposerOpen(false)
      resetComposer()
    } catch {
      setIsSaving(false)
      void notifications.error(
        t('calendar.feedback.deleteFailed'),
        t('calendar.feedback.tryAgain')
      )
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="mx-auto flex min-h-full w-full max-w-(--axis-content-max) flex-col px-(--axis-page-gutter) pb-10 pt-6 sm:pt-8">
        <header className="flex flex-wrap items-start justify-between gap-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {t('calendar.pageTitle')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('calendar.description')}
            </p>
          </div>
          <Button
            type="button"
            size="lg"
            onClick={() => openAllDayComposer(selectedDate)}
          >
            <Plus className="size-4" />
            {t('calendar.addEvent')}
          </Button>
        </header>

        <section
          className="mt-7 grid min-h-[690px] flex-1 overflow-hidden rounded-3xl border border-border bg-surface shadow-neu-raised xl:grid-cols-[17rem_minmax(0,1fr)]"
          aria-label={t('calendar.pageTitle')}
          aria-busy={isLoading}
        >
          <SelectedDayRail
            dateISO={selectedDate}
            items={selectedItems}
            locale={i18n.language}
            onAdd={() => openAllDayComposer(selectedDate)}
            onOpenItem={openItem}
          />

          <div className="min-w-0 bg-surface">
            <CalendarToolbar
              label={periodLabel}
              view={view}
              onViewChange={handleViewChange}
              onToday={returnToToday}
              onPrevious={() => movePeriod(-1)}
              onNext={() => movePeriod(1)}
            />

            <div className="max-h-[calc(100vh-14rem)] min-h-[610px] overflow-auto bg-surface-sunken shadow-neu-pressed">
              {view === 'month' ? (
                <MonthCalendar
                  days={visibleDays}
                  selectedDate={selectedDate}
                  todayISO={todayISO}
                  events={events}
                  tasks={tasks}
                  locale={i18n.language}
                  onCreate={openAllDayComposer}
                  onOpenItem={openItem}
                />
              ) : (
                <WeekCalendar
                  days={visibleDays}
                  selectedDate={selectedDate}
                  todayISO={todayISO}
                  events={events}
                  tasks={tasks}
                  locale={i18n.language}
                  onCreateAllDay={openAllDayComposer}
                  onCreateAtTime={openTimedComposer}
                  onOpenItem={openItem}
                />
              )}
            </div>
          </div>
        </section>
      </div>

      <Sheet
        open={composerOpen}
        onOpenChange={open => {
          setComposerOpen(open)
          if (!open) resetComposer()
        }}
      >
        <SheetContent className="gap-0 border-border bg-surface p-0 sm:max-w-lg">
          <SheetHeader className="border-b border-border px-6 py-5 pe-14">
            <SheetTitle className="text-xl tracking-tight">
              {editingEvent ? t('calendar.editEvent') : t('calendar.newItem')}
            </SheetTitle>
            <SheetDescription>
              {editingEvent
                ? t('calendar.editDescription')
                : t('calendar.createDescription')}
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {!editingEvent ? (
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  {t('calendar.itemType')}
                </p>
                <SegmentedControl
                  value={composerKind}
                  onValueChange={value => {
                    const nextKind = value as ComposerKind
                    setComposerKind(nextKind)
                    if (nextKind === 'task') setAllDay(true)
                  }}
                  options={[
                    {
                      value: 'event',
                      label: t('calendar.types.event'),
                      icon: CalendarDays,
                    },
                    {
                      value: 'task',
                      label: t('calendar.types.task'),
                      icon: CheckSquare2,
                    },
                  ]}
                  aria-label={t('calendar.itemType')}
                />
              </div>
            ) : null}

            <div>
              <label
                htmlFor="calendar-item-title"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                {t('calendar.title')}
              </label>
              <Input
                id="calendar-item-title"
                value={title}
                onChange={event => setTitle(event.target.value)}
                placeholder={
                  composerKind === 'task'
                    ? t('calendar.taskTitlePlaceholder')
                    : t('calendar.titlePlaceholder')
                }
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="calendar-item-description"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                {t('calendar.notes')}
              </label>
              <textarea
                id="calendar-item-description"
                value={description}
                onChange={event => setDescription(event.target.value)}
                placeholder={t('calendar.notesPlaceholder')}
                rows={4}
                className="w-full resize-none rounded-xl border border-border bg-surface-sunken px-3 py-2.5 text-sm leading-6 text-foreground shadow-neu-pressed outline-none placeholder:text-foreground-disabled focus-visible:border-primary/60 focus-visible:shadow-focus-input"
              />
            </div>

            {composerKind === 'event' ? (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-elevated px-3 py-3 shadow-neu-raised-sm">
                <Checkbox
                  id="calendar-all-day"
                  checked={allDay}
                  onCheckedChange={checked => {
                    const nextAllDay = Boolean(checked)
                    setAllDay(nextAllDay)
                    if (nextAllDay) {
                      setStartValue(startValue.slice(0, 10))
                      setEndValue(endValue.slice(0, 10))
                    } else {
                      const date = startValue.slice(0, 10) || selectedDate
                      const start = new Date(`${date}T09:00:00`)
                      const end = new Date(start.getTime() + 60 * 60 * 1000)
                      setStartValue(toDateTimeLocalValue(start.toISOString()))
                      setEndValue(toDateTimeLocalValue(end.toISOString()))
                    }
                  }}
                />
                <label
                  htmlFor="calendar-all-day"
                  className="text-sm font-medium text-foreground"
                >
                  {t('calendar.allDay')}
                </label>
              </div>
            ) : null}

            <div
              className={cn(
                'grid gap-4',
                composerKind === 'event' && 'sm:grid-cols-2'
              )}
            >
              <div>
                <label
                  htmlFor="calendar-start"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  {composerKind === 'task'
                    ? t('calendar.date')
                    : t('calendar.start')}
                </label>
                <Input
                  id="calendar-start"
                  type={
                    allDay || composerKind === 'task'
                      ? 'date'
                      : 'datetime-local'
                  }
                  value={composerKind === 'task' ? startDate : startValue}
                  onChange={event => setStartValue(event.target.value)}
                />
              </div>

              {composerKind === 'event' ? (
                <div>
                  <label
                    htmlFor="calendar-end"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    {t('calendar.end')}
                  </label>
                  <Input
                    id="calendar-end"
                    type={allDay ? 'date' : 'datetime-local'}
                    value={endValue}
                    min={startValue}
                    onChange={event => setEndValue(event.target.value)}
                    aria-invalid={rangeIsInvalid}
                    aria-describedby={
                      rangeIsInvalid ? 'calendar-range-error' : undefined
                    }
                  />
                  {rangeIsInvalid ? (
                    <p
                      id="calendar-range-error"
                      role="alert"
                      className="mt-2 text-xs text-destructive"
                    >
                      {t('calendar.invalidRange')}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <SheetFooter className="flex-row justify-between border-t border-border px-6 py-5">
            <div>
              {editingEvent ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => void handleDelete()}
                  disabled={isSaving}
                >
                  <Trash2 className="size-4" />
                  {t('common.delete')}
                </Button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setComposerOpen(false)}
                disabled={isSaving}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="button"
                onClick={() => void handleSave()}
                disabled={!composerIsValid || isSaving}
              >
                {isSaving ? t('calendar.saving') : t('common.save')}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
