import { useEffect, useRef, useState } from 'react'
import {
  CalendarDays,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  Inbox,
  Plus,
  Search,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TaskDetailsSheet } from '@/components/tasks/TaskDetailsSheet'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { notifications } from '@/lib/notifications'
import {
  countTasksByView,
  filterTasksByView,
  getDefaultTaskDueDate,
  getTaskViewForDueDate,
  type TaskView,
} from '@/lib/tasks-page-domain'
import { cn } from '@/lib/utils'
import type { Task } from '@/store/tasks-store'
import { getTodayISO, useTasksStore } from '@/store/tasks-store'

function isoToDate(value: string | null | undefined) {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

function dateToIso(value: Date | null | undefined) {
  if (!value) return null
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTaskDate(
  value: string,
  today: string,
  locale: string,
  t: (key: string, options?: Record<string, unknown>) => string
) {
  if (value === today) return t('tasks.date.today')

  const date = isoToDate(value)
  const todayDate = isoToDate(today)
  if (!date || !todayDate) return value

  const dayDifference = Math.round(
    (date.getTime() - todayDate.getTime()) / 86_400_000
  )
  if (dayDifference < 0) {
    return t('tasks.date.daysAgo', { days: Math.abs(dayDifference) })
  }
  if (dayDifference === 1) return t('tasks.date.tomorrow')
  if (dayDifference <= 7) return t('tasks.date.inDays', { days: dayDifference })

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

function TaskRow({
  task,
  selected,
  today,
  onSelect,
  onToggle,
}: {
  task: Task
  selected: boolean
  today: string
  onSelect: () => void
  onToggle: () => void
}) {
  const { t, i18n } = useTranslation()
  const completed = task.status === 'done'
  const completedSteps = task.subtasks.filter(item => item.completed).length

  return (
    <div
      className={cn(
        'group flex items-center gap-3 px-4 py-3.5 transition-colors',
        selected ? 'bg-accent' : 'hover:bg-accent/55'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={t(
          completed
            ? 'widgets.tasks.markIncompleteAria'
            : 'widgets.tasks.markCompleteAria'
        )}
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-xl border border-border-strong bg-surface shadow-neu-raised-sm transition-[background-color,border-color,color,box-shadow,transform] hover:border-primary/60 hover:bg-accent active:translate-y-px active:shadow-neu-pressed focus-visible:shadow-focus-ring focus-visible:outline-none',
          completed &&
            'border-primary/50 bg-primary text-primary-foreground shadow-neu-pressed'
        )}
      >
        {completed ? <Check className="size-4" strokeWidth={2.5} /> : null}
      </button>

      <button
        type="button"
        onClick={onSelect}
        aria-label={t('tasks.row.openDetails', { title: task.title })}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-start focus-visible:shadow-focus-ring focus-visible:outline-none"
      >
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block truncate text-sm font-medium text-foreground',
              completed && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </span>
          {task.description ? (
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {task.description}
            </span>
          ) : null}
        </span>

        <span className="flex shrink-0 items-center gap-3">
          {task.subtasks.length > 0 ? (
            <span className="text-xs tabular-nums text-muted-foreground">
              {completedSteps}/{task.subtasks.length}
            </span>
          ) : null}
          <span
            className={cn(
              'size-2 rounded-full',
              task.priority === 'high' && 'bg-destructive',
              task.priority === 'medium' && 'bg-primary',
              task.priority === 'low' && 'bg-muted-foreground/45'
            )}
            role="img"
            aria-label={t(`tasks.priority.${task.priority}`)}
            title={t(`tasks.priority.${task.priority}`)}
          />
          {task.due_date ? (
            <span
              className={cn(
                'inline-flex min-w-20 items-center justify-end gap-1.5 text-xs tabular-nums text-muted-foreground',
                !completed && task.due_date < today && 'text-destructive'
              )}
            >
              <CalendarClock className="size-3.5" />
              {formatTaskDate(task.due_date, today, i18n.language, t)}
            </span>
          ) : (
            <span className="min-w-20 text-end text-xs text-muted-foreground">
              {t('tasks.date.none')}
            </span>
          )}
          <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transform-none" />
        </span>
      </button>
    </div>
  )
}

function QuickTaskCapture({
  activeView,
  today,
  onCreated,
}: {
  activeView: TaskView
  today: string
  onCreated: (view: Exclude<TaskView, 'completed'>) => void
}) {
  const { t, i18n } = useTranslation()
  const addTask = useTasksStore(state => state.addTask)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [quickDueDate, setQuickDueDate] = useState<string | null>(() =>
    getDefaultTaskDueDate(activeView, today)
  )
  const [quickDateOpen, setQuickDateOpen] = useState(false)
  const quickAddRef = useRef<HTMLInputElement>(null)
  const tomorrowDueDate = getDefaultTaskDueDate('upcoming', today)
  const quickDateLabel = quickDueDate
    ? formatTaskDate(quickDueDate, today, i18n.language, t)
    : t('tasks.date.none')

  useEffect(() => {
    const focusQuickAdd = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const editing = ['INPUT', 'TEXTAREA'].includes(target.tagName)
      if (
        event.key.toLowerCase() === 'n' &&
        !editing &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        event.preventDefault()
        quickAddRef.current?.focus()
      }
    }

    window.addEventListener('keydown', focusQuickAdd)
    return () => window.removeEventListener('keydown', focusQuickAdd)
  }, [])

  const handleQuickAdd = async () => {
    const title = newTaskTitle.trim()
    if (!title) return

    try {
      await addTask(title, { due_date: quickDueDate })
      setNewTaskTitle('')
      onCreated(getTaskViewForDueDate(quickDueDate, today))
      requestAnimationFrame(() => quickAddRef.current?.focus())
    } catch {
      void notifications.error(
        t('tasks.feedback.createFailed'),
        t('tasks.feedback.tryAgain')
      )
    }
  }

  const selectQuickDueDate = (value: string | null) => {
    setQuickDueDate(value)
    setQuickDateOpen(false)
  }

  return (
    <form
      className="mt-7 flex w-full max-w-3xl flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface p-3 shadow-neu-raised"
      onSubmit={event => {
        event.preventDefault()
        void handleQuickAdd()
      }}
    >
      <Plus className="ml-1 size-5 shrink-0 text-muted-foreground" />
      <label htmlFor="tasks-quick-add" className="sr-only">
        {t('tasks.quickAdd.label')}
      </label>
      <input
        ref={quickAddRef}
        id="tasks-quick-add"
        value={newTaskTitle}
        onChange={event => setNewTaskTitle(event.target.value)}
        placeholder={t('tasks.quickAdd.placeholder')}
        className="h-10 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-foreground-disabled"
      />
      <Popover open={quickDateOpen} onOpenChange={setQuickDateOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="lg"
            variant="outline"
            aria-label={t('tasks.quickAdd.dateAria', {
              date: quickDateLabel,
            })}
            className="min-w-32 justify-between"
          >
            <CalendarDays className="size-4" />
            {quickDateLabel}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 space-y-4">
          <p className="text-sm font-medium">{t('tasks.quickAdd.when')}</p>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              size="sm"
              variant={quickDueDate === today ? 'default' : 'outline'}
              onClick={() => selectQuickDueDate(today)}
            >
              {t('tasks.date.today')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={quickDueDate === tomorrowDueDate ? 'default' : 'outline'}
              onClick={() => selectQuickDueDate(tomorrowDueDate)}
            >
              {t('tasks.date.tomorrow')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={quickDueDate === null ? 'default' : 'outline'}
              onClick={() => selectQuickDueDate(null)}
            >
              {t('tasks.date.none')}
            </Button>
          </div>
          <div className="border-t border-border pt-3">
            <Calendar
              mode="single"
              selected={isoToDate(quickDueDate)}
              onSelect={date => selectQuickDueDate(dateToIso(date))}
              disabled={{ before: isoToDate(today) ?? new Date() }}
              className="mx-auto bg-transparent p-0"
            />
          </div>
        </PopoverContent>
      </Popover>
      <Button type="submit" size="lg" disabled={!newTaskTitle.trim()}>
        {t('tasks.quickAdd.submit')}
      </Button>
    </form>
  )
}

interface TasksPageProps {
  initialSelectedTaskId?: string
}

export function TasksPage({ initialSelectedTaskId }: TasksPageProps) {
  const { t } = useTranslation()
  const tasks = useTasksStore(state => state.tasks)
  const isLoading = useTasksStore(state => state.isLoading)
  const selectedTaskId = useTasksStore(state => state.selectedTaskId)
  const loadTasks = useTasksStore(state => state.loadTasks)
  const toggleComplete = useTasksStore(state => state.toggleComplete)
  const setSelectedTask = useTasksStore(state => state.setSelectedTask)

  const [activeView, setActiveView] = useState<TaskView>('today')
  const [search, setSearch] = useState('')
  const didSyncInitialTask = useRef(false)

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  useEffect(() => {
    if (didSyncInitialTask.current || !initialSelectedTaskId) return
    didSyncInitialTask.current = true
    setSelectedTask(initialSelectedTaskId)
  }, [initialSelectedTaskId, setSelectedTask])

  const today = getTodayISO()
  const counts = countTasksByView(tasks, today)
  const visibleTasks = filterTasksByView(tasks, activeView, today).filter(
    task => {
      const query = search.trim().toLocaleLowerCase()
      if (!query) return true
      return `${task.title} ${task.description ?? ''}`
        .toLocaleLowerCase()
        .includes(query)
    }
  )
  const selectedTask = tasks.find(task => task.id === selectedTaskId) ?? null
  const openCount = tasks.filter(task => task.status !== 'done').length

  const viewOptions = (
    ['today', 'upcoming', 'undated', 'completed'] as const
  ).map(value => ({
    value,
    label: (
      <span className="inline-flex items-center gap-2">
        <span>{t(`tasks.tabs.${value}`)}</span>
        <span className="rounded-full bg-surface-sunken px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground shadow-neu-pressed">
          {counts[value]}
        </span>
      </span>
    ),
  }))

  const handleToggle = async (taskId: string) => {
    await toggleComplete(taskId)
    if (selectedTaskId === taskId && activeView !== 'completed') {
      setSelectedTask(null)
    }
  }

  const emptyMessage = search.trim()
    ? t('tasks.empty.search')
    : t(`tasks.empty.${activeView}`)

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-(--axis-content-max) px-(--axis-page-gutter) pb-10 pt-6 sm:pt-8">
        <header className="flex flex-wrap items-start justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {t('tasks.pageTitle')}
              </h1>
              <span className="text-sm tabular-nums text-muted-foreground">
                {t('tasks.openCount', { count: openCount })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('tasks.description')}
            </p>
          </div>

          <label className="flex h-10 w-full max-w-sm items-center gap-2 rounded-xl border border-border-strong bg-surface-sunken px-3 text-muted-foreground shadow-neu-pressed focus-within:border-primary/60 focus-within:shadow-focus-input sm:w-80">
            <Search className="size-4 shrink-0" />
            <span className="sr-only">{t('tasks.search.label')}</span>
            <input
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder={t('tasks.search.placeholder')}
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-disabled"
            />
          </label>
        </header>

        <QuickTaskCapture
          key={`${activeView}-${today}`}
          activeView={activeView}
          today={today}
          onCreated={setActiveView}
        />

        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SegmentedControl
            value={activeView}
            onValueChange={value => setActiveView(value as TaskView)}
            options={viewOptions}
            aria-label={t('tasks.filters.label')}
            className="w-full sm:w-auto"
          />
          <p className="text-xs text-muted-foreground">
            {t('tasks.keyboardHint')}
          </p>
        </div>

        <section
          aria-label={t(`tasks.tabs.${activeView}`)}
          className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-neu-raised"
        >
          {isLoading ? (
            <div className="divide-y divide-border" aria-busy="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-4 py-3.5"
                >
                  <span className="size-8 animate-pulse rounded-xl bg-muted" />
                  <span className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
                </div>
              ))}
            </div>
          ) : visibleTasks.length > 0 ? (
            <div className="divide-y divide-border">
              {visibleTasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  selected={task.id === selectedTaskId}
                  today={today}
                  onSelect={() => setSelectedTask(task.id)}
                  onToggle={() => void handleToggle(task.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-4 px-5 py-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border-strong bg-surface-elevated text-muted-foreground shadow-neu-raised-sm">
                <Inbox className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {emptyMessage}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('tasks.empty.hint')}
                </p>
              </div>
              {search.trim() ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSearch('')}
                >
                  {t('tasks.search.clear')}
                </Button>
              ) : null}
            </div>
          )}
        </section>
      </div>

      {selectedTask ? (
        <TaskDetailsSheet
          key={selectedTask.id}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      ) : null}
    </div>
  )
}
