import { describe, expect, it } from 'vitest'
import type { Task } from '@/store/tasks-store'
import {
  countTasksByView,
  filterTasksByView,
  getDefaultTaskDueDate,
  getTaskViewForDueDate,
} from './tasks-page-domain'

const baseTask: Task = {
  id: 'task',
  title: 'Task',
  priority: 'medium',
  status: 'todo',
  created_at: '2026-09-08T10:00:00.000Z',
  updated_at: '2026-09-08T10:00:00.000Z',
  sort_order: 0,
  subtasks: [],
}

function task(overrides: Partial<Task>): Task {
  return { ...baseTask, ...overrides }
}

describe('tasks page views', () => {
  const today = '2026-09-08'
  const tasks = [
    task({ id: 'overdue', due_date: '2026-09-07' }),
    task({ id: 'today', due_date: today, sort_order: 1 }),
    task({ id: 'upcoming', due_date: '2026-09-12' }),
    task({ id: 'undated' }),
    task({
      id: 'completed',
      status: 'done',
      due_date: today,
      completed_at: '2026-09-08T12:00:00.000Z',
    }),
  ]

  it('keeps overdue work with today and separates undated work', () => {
    expect(
      filterTasksByView(tasks, 'today', today).map(item => item.id)
    ).toEqual(['overdue', 'today'])
    expect(
      filterTasksByView(tasks, 'undated', today).map(item => item.id)
    ).toEqual(['undated'])
  })

  it('keeps future and completed work in their own views', () => {
    expect(
      filterTasksByView(tasks, 'upcoming', today).map(item => item.id)
    ).toEqual(['upcoming'])
    expect(
      filterTasksByView(tasks, 'completed', today).map(item => item.id)
    ).toEqual(['completed'])
  })

  it('reports counts for the four canonical filters', () => {
    expect(countTasksByView(tasks, today)).toEqual({
      today: 2,
      upcoming: 1,
      undated: 1,
      completed: 1,
    })
  })

  it('uses the active filter as the visible quick-create date default', () => {
    expect(getDefaultTaskDueDate('today', today)).toBe(today)
    expect(getDefaultTaskDueDate('upcoming', today)).toBe('2026-09-09')
    expect(getDefaultTaskDueDate('undated', today)).toBeNull()
    expect(getDefaultTaskDueDate('completed', today)).toBe(today)
  })

  it('reveals a newly created task in the matching temporal view', () => {
    expect(getTaskViewForDueDate(today, today)).toBe('today')
    expect(getTaskViewForDueDate('2026-09-14', today)).toBe('upcoming')
    expect(getTaskViewForDueDate(null, today)).toBe('undated')
  })
})
