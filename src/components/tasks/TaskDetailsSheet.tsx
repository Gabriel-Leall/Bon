import { useState } from 'react'
import { Check, ListChecks, Play, Plus, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Calendar, type RangeValue } from '@/components/calendar'
import { Button } from '@/components/ui/button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { notifications } from '@/lib/notifications'
import type { Priority, Task } from '@/store/tasks-store'
import { useTasksStore } from '@/store/tasks-store'
import { usePomodoroStore } from '@/store/pomodoro-store'
import { useUIStore } from '@/store/ui-store'

type PersistTask = (updates: Partial<Task>) => Promise<boolean>

function isoToDate(value: string | undefined) {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

function dateToIso(value: Date | null | undefined) {
  if (!value) return undefined
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function TaskTextFields({
  task,
  title,
  description,
  setTitle,
  setDescription,
  persist,
}: {
  task: Task
  title: string
  description: string
  setTitle: (value: string) => void
  setDescription: (value: string) => void
  persist: PersistTask
}) {
  const { t } = useTranslation()

  const saveTitle = async () => {
    const nextTitle = title.trim()
    if (!nextTitle) {
      setTitle(task.title)
      return
    }
    if (nextTitle !== task.title) await persist({ title: nextTitle })
  }

  const saveDescription = async () => {
    const nextDescription = description.trim() || undefined
    if (nextDescription !== task.description) {
      await persist({ description: nextDescription })
    }
  }

  return (
    <>
      <div className="space-y-2">
        <label htmlFor="task-detail-title" className="text-sm font-medium">
          {t('tasks.detail.titleLabel')}
        </label>
        <input
          id="task-detail-title"
          value={title}
          onChange={event => setTitle(event.target.value)}
          onBlur={() => void saveTitle()}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.currentTarget.blur()
            }
          }}
          className="h-11 w-full rounded-xl border border-border-strong bg-surface-sunken px-3 text-base font-medium text-foreground shadow-neu-pressed outline-none placeholder:text-foreground-disabled focus:border-primary/60 focus:shadow-focus-input"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="task-detail-note" className="text-sm font-medium">
          {t('tasks.detail.noteLabel')}
        </label>
        <textarea
          id="task-detail-note"
          value={description}
          onChange={event => setDescription(event.target.value)}
          onBlur={() => void saveDescription()}
          rows={4}
          placeholder={t('tasks.detail.notePlaceholder')}
          className="w-full resize-none rounded-xl border border-border-strong bg-surface-sunken px-3 py-2.5 text-sm leading-6 text-foreground shadow-neu-pressed outline-none placeholder:text-foreground-disabled focus:border-primary/60 focus:shadow-focus-input"
        />
      </div>
    </>
  )
}

function TaskPlanningFields({
  task,
  dateRange,
  setDateRange,
  persist,
}: {
  task: Task
  dateRange: RangeValue | null
  setDateRange: (value: RangeValue | null) => void
  persist: PersistTask
}) {
  const { t } = useTranslation()
  const priorityOptions = (['low', 'medium', 'high'] as const).map(value => ({
    value,
    label: t(`tasks.priority.${value}`),
  }))

  const changeDate = async (nextRange: RangeValue | null) => {
    setDateRange(nextRange)
    const nextDate = nextRange?.start
      ? dateToIso(nextRange.end ?? nextRange.start)
      : undefined
    await persist({ due_date: nextDate })
  }

  const changePriority = async (nextPriority: Priority) => {
    if (nextPriority === task.priority) return
    await persist({ priority: nextPriority })
  }

  return (
    <>
      <div className="space-y-3">
        <span className="text-sm font-medium">
          {t('tasks.detail.priorityLabel')}
        </span>
        <SegmentedControl
          value={task.priority}
          onValueChange={value => void changePriority(value as Priority)}
          options={priorityOptions}
          aria-label={t('tasks.detail.priorityLabel')}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <span className="text-sm font-medium">
          {t('tasks.detail.dateLabel')}
        </span>
        <div className="rounded-2xl border border-border bg-surface-sunken p-3 shadow-neu-pressed">
          <Calendar
            value={dateRange}
            onChange={nextRange => void changeDate(nextRange)}
            compact
            allowClear
            showTimeInput={false}
          />
        </div>
      </div>
    </>
  )
}

function TaskStepsSection({ task }: { task: Task }) {
  const { t } = useTranslation()
  const addSubtask = useTasksStore(state => state.addSubtask)
  const toggleSubtask = useTasksStore(state => state.toggleSubtask)
  const deleteSubtask = useTasksStore(state => state.deleteSubtask)
  const [newSubtask, setNewSubtask] = useState('')

  const runStepAction = async (action: () => Promise<void>) => {
    try {
      await action()
    } catch {
      void notifications.error(
        t('tasks.feedback.updateFailed'),
        t('tasks.feedback.tryAgain')
      )
    }
  }

  const handleAddSubtask = async () => {
    const nextTitle = newSubtask.trim()
    if (!nextTitle) return
    await runStepAction(() => addSubtask(task.id, nextTitle))
    setNewSubtask('')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          <ListChecks className="size-4 text-muted-foreground" />
          {t('tasks.detail.stepsLabel')}
        </span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {task.subtasks.filter(item => item.completed).length}/
          {task.subtasks.length}
        </span>
      </div>

      {task.subtasks.length > 0 ? (
        <div className="divide-y divide-border">
          {task.subtasks.map(subtask => (
            <div
              key={subtask.id}
              className="group flex items-center gap-3 py-2.5"
            >
              <button
                type="button"
                onClick={() =>
                  void runStepAction(() => toggleSubtask(task.id, subtask.id))
                }
                aria-label={t(
                  subtask.completed
                    ? 'tasks.detail.markStepOpen'
                    : 'tasks.detail.markStepDone'
                )}
                className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border-strong bg-surface shadow-neu-raised-sm transition-[background-color,color,box-shadow,transform] hover:bg-accent active:translate-y-px active:shadow-neu-pressed focus-visible:shadow-focus-ring focus-visible:outline-none"
              >
                {subtask.completed ? <Check className="size-4" /> : null}
              </button>
              <span
                className={`min-w-0 flex-1 text-sm ${subtask.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
              >
                {subtask.title}
              </span>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                onClick={() =>
                  void runStepAction(() => deleteSubtask(task.id, subtask.id))
                }
                aria-label={t('tasks.detail.deleteStep')}
                className="text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-2 rounded-xl border border-border-strong bg-surface-sunken p-1.5 shadow-neu-pressed focus-within:border-primary/60 focus-within:shadow-focus-input">
        <Plus className="ml-2 size-4 shrink-0 text-muted-foreground" />
        <input
          value={newSubtask}
          onChange={event => setNewSubtask(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              void handleAddSubtask()
            }
          }}
          placeholder={t('tasks.detail.addStep')}
          aria-label={t('tasks.detail.addStep')}
          className="h-8 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-disabled"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void handleAddSubtask()}
          disabled={!newSubtask.trim()}
        >
          {t('tasks.detail.add')}
        </Button>
      </div>
    </div>
  )
}

function TaskSheetActions({
  completed,
  onToggleStatus,
  onFocus,
}: {
  completed: boolean
  onToggleStatus: () => void
  onFocus: () => void
}) {
  const { t } = useTranslation()

  return (
    <SheetFooter className="flex-row border-t border-border px-6 py-5">
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        onClick={onToggleStatus}
      >
        <Check className="size-4" />
        {t(completed ? 'tasks.detail.reopen' : 'tasks.detail.complete')}
      </Button>
      <Button
        type="button"
        className="flex-1"
        onClick={onFocus}
        disabled={completed}
      >
        <Play className="size-4" fill="currentColor" />
        {t('tasks.detail.startFocus')}
      </Button>
    </SheetFooter>
  )
}

export function TaskDetailsSheet({
  task,
  onClose,
}: {
  task: Task
  onClose: () => void
}) {
  const { t } = useTranslation()
  const updateTask = useTasksStore(state => state.updateTask)
  const deleteTask = useTasksStore(state => state.deleteTask)
  const startContextualFocus = usePomodoroStore(
    state => state.startContextualFocus
  )
  const navigateTo = useUIStore(state => state.navigateTo)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [dateRange, setDateRange] = useState<RangeValue | null>(() => {
    const dueDate = isoToDate(task.due_date)
    return dueDate ? { start: dueDate, end: null } : null
  })

  const persist: PersistTask = async updates => {
    try {
      await updateTask(task.id, updates)
      return true
    } catch {
      void notifications.error(
        t('tasks.feedback.updateFailed'),
        t('tasks.feedback.tryAgain')
      )
      return false
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTask(task.id)
      onClose()
    } catch {
      void notifications.error(
        t('tasks.feedback.deleteFailed'),
        t('tasks.feedback.tryAgain')
      )
    }
  }

  const handleFocus = async () => {
    const started = await startContextualFocus(task.id)
    if (!started) {
      void notifications.error(
        t('tasks.feedback.focusFailed'),
        t('tasks.feedback.tryAgain')
      )
      return
    }
    navigateTo('focus')
  }

  const toggleTaskStatus = async () => {
    await persist({
      status: task.status === 'done' ? 'todo' : 'done',
      completed_at:
        task.status === 'done' ? undefined : new Date().toISOString(),
    })
  }

  return (
    <Sheet open onOpenChange={open => !open && onClose()}>
      <SheetContent className="gap-0 border-border bg-surface p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border px-6 py-5 pr-14">
          <SheetTitle className="text-xl tracking-tight">
            {t('tasks.detail.heading')}
          </SheetTitle>
          <SheetDescription>{t('tasks.detail.description')}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <TaskTextFields
            task={task}
            title={title}
            description={description}
            setTitle={setTitle}
            setDescription={setDescription}
            persist={persist}
          />
          <TaskPlanningFields
            task={task}
            dateRange={dateRange}
            setDateRange={setDateRange}
            persist={persist}
          />
          <TaskStepsSection task={task} />
          <Button
            type="button"
            variant="ghost"
            onClick={() => void handleDelete()}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
            {t('tasks.detail.delete')}
          </Button>
        </div>

        <TaskSheetActions
          completed={task.status === 'done'}
          onToggleStatus={() => void toggleTaskStatus()}
          onFocus={() => void handleFocus()}
        />
      </SheetContent>
    </Sheet>
  )
}
