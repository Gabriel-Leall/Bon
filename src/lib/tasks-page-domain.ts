import type { Task } from '@/store/tasks-store'

export type TaskView = 'today' | 'upcoming' | 'undated' | 'completed'

export type TaskViewCounts = Record<TaskView, number>

function addDaysToIso(value: string, days: number) {
  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return value
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function getDefaultTaskDueDate(view: TaskView, today: string) {
  if (view === 'undated') return null
  if (view === 'upcoming') return addDaysToIso(today, 1)
  return today
}

export function getTaskViewForDueDate(
  dueDate: string | null,
  today: string
): Exclude<TaskView, 'completed'> {
  if (!dueDate) return 'undated'
  return dueDate <= today ? 'today' : 'upcoming'
}

function compareTasks(left: Task, right: Task) {
  if (left.due_date && right.due_date && left.due_date !== right.due_date) {
    return left.due_date.localeCompare(right.due_date)
  }

  return left.sort_order - right.sort_order
}

export function filterTasksByView(
  tasks: Task[],
  view: TaskView,
  today: string
): Task[] {
  return tasks
    .filter(task => {
      if (view === 'completed') return task.status === 'done'
      if (task.status === 'done') return false
      if (view === 'undated') return !task.due_date
      if (view === 'today')
        return Boolean(task.due_date && task.due_date <= today)
      return Boolean(task.due_date && task.due_date > today)
    })
    .sort((left, right) => {
      if (view === 'completed') {
        return (right.completed_at ?? right.updated_at).localeCompare(
          left.completed_at ?? left.updated_at
        )
      }

      return compareTasks(left, right)
    })
}

export function countTasksByView(tasks: Task[], today: string): TaskViewCounts {
  return {
    today: filterTasksByView(tasks, 'today', today).length,
    upcoming: filterTasksByView(tasks, 'upcoming', today).length,
    undated: filterTasksByView(tasks, 'undated', today).length,
    completed: filterTasksByView(tasks, 'completed', today).length,
  }
}
