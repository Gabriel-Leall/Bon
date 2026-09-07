import { useEffect, useState } from 'react'
import { CheckSquare, Plus } from 'lucide-react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { WidgetCard } from '../WidgetCard'
import { useTasksStore, selectTodayTasks, type Task } from '@/store/tasks-store'
import { cn } from '@/lib/utils'
import { getPriorityTagClass } from '@/lib/priority-tag-styles'

import { AnimatePresence, LazyMotion, domAnimation, m } from 'motion/react'
import { Skeleton } from '@/components/ui/skeleton'
import { listItemVariants } from '@/lib/motion-tokens'

function PriorityTag({
  priority,
  t,
}: {
  priority: Task['priority']
  t: TFunction
}) {
  const label =
    priority === 'high'
      ? t('tasks.priority.high')
      : priority === 'medium'
        ? t('tasks.priority.medium')
        : t('tasks.priority.low')

  return (
    <span
      className={cn('shrink-0 tracking-wide', getPriorityTagClass(priority))}
    >
      {label}
    </span>
  )
}

function QuickAddInput({
  onAdd,
  t,
}: {
  onAdd: (title: string) => Promise<void>
  t: TFunction
}) {
  const [value, setValue] = useState('')

  const handleSubmit = async () => {
    const trimmed = value.trim()
    if (!trimmed) return
    await onAdd(trimmed)
    setValue('')
  }

  return (
    <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface-sunken px-2.5 py-2 shadow-neu-pressed transition-[border-color,box-shadow] focus-within:border-primary/60 focus-within:shadow-focus-input">
      <Plus className="size-3 shrink-0 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            void handleSubmit()
          }
          if (e.key === 'Escape') setValue('')
        }}
        placeholder={t('widgets.tasks.quickAddPlaceholder')}
        aria-label={t('widgets.tasks.quickAddAria')}
        className="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground/50 outline-none"
      />
    </div>
  )
}

function TaskRow({
  task,
  onToggle,
  onSelect,
  t,
}: {
  task: Task
  onToggle: () => void
  onSelect: () => void
  t: TFunction
}) {
  const isDone = task.status === 'done'

  return (
    <m.div
      layout
      variants={listItemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onSelect}
      className="group flex cursor-pointer items-center gap-3 rounded-lg border border-border-strong bg-surface px-3 py-2.5 shadow-neu-raised-sm transition-[background-color,border-color,box-shadow,transform] hover:bg-surface-elevated active:translate-y-px active:shadow-neu-pressed"
    >
      <m.button
        type="button"
        aria-label={
          isDone
            ? t('widgets.tasks.markIncompleteAria')
            : t('widgets.tasks.markCompleteAria')
        }
        onClick={e => {
          e.stopPropagation()
          onToggle()
        }}
        whileTap={{ scale: 0.92 }}
        animate={{ scale: isDone ? [1, 1.08, 1] : 1 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'relative flex size-5 shrink-0 items-center justify-center rounded border shadow-neu-raised-sm transition-[background-color,border-color,box-shadow,transform] active:shadow-neu-pressed focus-visible:shadow-focus-ring focus-visible:outline-none',
          isDone
            ? 'border-primary bg-primary'
            : 'border-muted-foreground/60 group-hover:border-muted-foreground'
        )}
      >
        <AnimatePresence>
          {isDone && (
            <m.span
              className="pointer-events-none absolute inset-0 rounded border border-primary/70"
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 1.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait" initial={false}>
          {isDone && (
            <m.span
              key="check"
              initial={{ scale: 0.2, opacity: 0, rotate: -14 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.2, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <CheckSquare
                className="text-primary-foreground size-3"
                strokeWidth={2.5}
              />
            </m.span>
          )}
        </AnimatePresence>
      </m.button>

      <span
        className={cn(
          'flex-1 truncate font-sans text-sm',
          isDone ? 'text-muted-foreground line-through' : 'text-foreground'
        )}
      >
        {task.title}
      </span>

      <PriorityTag priority={task.priority} t={t} />
    </m.div>
  )
}

interface TasksWidgetProps {
  onNavigateToTasks?: (selectedTaskId?: string) => void
}

export function TasksWidget({ onNavigateToTasks }: TasksWidgetProps) {
  const { t } = useTranslation()

  const tasks = useTasksStore(state => state.tasks)
  const isLoading = useTasksStore(state => state.isLoading)
  const loadTasks = useTasksStore(state => state.loadTasks)
  const addTask = useTasksStore(state => state.addTask)
  const toggleComplete = useTasksStore(state => state.toggleComplete)
  const setSelectedTask = useTasksStore(state => state.setSelectedTask)

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  const todayTasks = selectTodayTasks(tasks)
  const fallbackTasks = tasks.filter(t => t.status !== 'done')
  const visibleTasks = (
    todayTasks.length > 0 ? todayTasks : fallbackTasks
  ).slice(0, 4)
  const totalCount = todayTasks.length
  const pendingCount = todayTasks.filter(t => t.status !== 'done').length

  const handleAddTask = async (title: string) => {
    try {
      await addTask(title, { priority: 'medium' })
    } catch {
      // Keep widget usable if quick add fails.
    }
  }

  const handleSelect = (taskId: string) => {
    setSelectedTask(taskId)
    onNavigateToTasks?.(taskId)
  }

  return (
    <WidgetCard title={t('widgets.tasks.title')} icon={CheckSquare}>
      <LazyMotion features={domAnimation}>
        <div className="flex h-full flex-col">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {t('widgets.tasks.header')}
            </span>
            <div className="flex items-center gap-3">
              {totalCount > 0 && (
                <span className="font-mono text-[10px] text-muted-foreground">
                  {pendingCount} / {totalCount}
                </span>
              )}
              <button
                type="button"
                onClick={() => onNavigateToTasks?.()}
                className="rounded-sm px-1 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:shadow-focus-ring focus-visible:outline-none"
              >
                {t('widgets.tasks.viewAll')}
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-1">
            {isLoading ? (
              <m.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2 px-1 py-1"
              >
                {[...Array(3)].map((_, i) => (
                  <div
                    key={`task-skeleton-${i}`}
                    className="flex items-center gap-2 rounded-lg border border-border-strong bg-surface p-3 shadow-neu-raised-sm"
                  >
                    <Skeleton className="size-4 shrink-0 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </m.div>
            ) : visibleTasks.length === 0 ? (
              <m.div
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-1 flex-col items-center justify-center gap-1.5 py-4 text-center"
              >
                <CheckSquare
                  className="size-5 text-muted-foreground/30"
                  strokeWidth={1.5}
                />
                <span className="text-[12px] text-muted-foreground/50">
                  {t('widgets.tasks.empty')}
                </span>
              </m.div>
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                {visibleTasks.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={() => toggleComplete(task.id)}
                    onSelect={() => handleSelect(task.id)}
                    t={t}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          <QuickAddInput onAdd={handleAddTask} t={t} />
        </div>
      </LazyMotion>
    </WidgetCard>
  )
}
