import { describe, expect, it } from 'vitest'
import {
  buildTomorrowFocusCandidates,
  buildWrapUpSnapshot,
  getTomorrowISO,
  splitWrapUpTasks,
} from './wrap-up-domain'
import type { Task } from '@/store/tasks-store'

function task(id: string, overrides: Partial<Task> = {}): Task {
  return {
    id,
    title: id,
    priority: 'medium' as const,
    status: 'todo' as const,
    created_at: '2026-06-01T09:00:00.000Z',
    updated_at: '2026-06-01T09:00:00.000Z',
    sort_order: 0,
    subtasks: [],
    ...overrides,
  }
}

describe('wrap-up-domain', () => {
  it('computes tomorrow in local date format', () => {
    expect(getTomorrowISO(new Date('2026-06-02T12:00:00'))).toBe('2026-06-03')
  })

  it('splits completed and open tasks', () => {
    const result = splitWrapUpTasks([
      {
        id: 'done',
        title: 'Done',
        priority: 'medium',
        status: 'done',
        created_at: '',
        updated_at: '',
        sort_order: 0,
        subtasks: [],
      },
      {
        id: 'open',
        title: 'Open',
        priority: 'high',
        status: 'todo',
        created_at: '',
        updated_at: '',
        sort_order: 1,
        subtasks: [],
      },
    ])

    expect(result.completed).toHaveLength(1)
    expect(result.open).toHaveLength(1)
    expect(result.open[0]?.id).toBe('open')
  })

  it('limits the closure to work completed today or still relevant today', () => {
    const result = splitWrapUpTasks(
      [
        task('completed-today', {
          status: 'done',
          completed_at: '2026-06-02T15:00:00.000Z',
        }),
        task('completed-before', {
          status: 'done',
          completed_at: '2026-06-01T15:00:00.000Z',
        }),
        task('overdue', { due_date: '2026-06-01' }),
        task('tomorrow', { due_date: '2026-06-03' }),
        task('undated-focus'),
      ],
      '2026-06-02',
      'undated-focus'
    )

    expect(result.completed.map(item => item.id)).toEqual(['completed-today'])
    expect(result.open.map(item => item.id)).toEqual([
      'overdue',
      'undated-focus',
    ])
  })

  it('builds one closure snapshot without mixing the source identities', () => {
    const result = buildWrapUpSnapshot({
      todayISO: '2026-06-02',
      tomorrowISO: '2026-06-03',
      focusTaskId: 'focus-task',
      tasks: [
        task('focus-task'),
        task('tomorrow-task', { due_date: '2026-06-03' }),
      ],
      events: [
        {
          id: 'event-today',
          title: 'Review',
          description: null,
          start_date: '2026-06-02T14:00:00.000Z',
          end_date: '2026-06-02T15:00:00.000Z',
          all_day: false,
          color: null,
          created_at: '',
          updated_at: '',
        },
        {
          id: 'event-tomorrow',
          title: 'Planning',
          description: null,
          start_date: '2026-06-03T14:00:00.000Z',
          end_date: '2026-06-03T15:00:00.000Z',
          all_day: false,
          color: null,
          created_at: '',
          updated_at: '',
        },
      ],
      habits: [
        {
          id: 'habit',
          name: 'Walk',
          color: '#fff',
          frequency: 'daily',
          active: true,
          sort_order: 0,
          created_at: '',
          updated_at: '',
        },
      ],
      habitLogs: [
        {
          id: 'log',
          habit_id: 'habit',
          completed_date: '2026-06-02',
          completed_at: '2026-06-02T18:00:00.000Z',
          state: 'done',
        },
      ],
      sessions: [
        {
          id: 'session',
          session_type: 'focus',
          duration_seconds: 1500,
          completed: true,
          task_id: null,
          started_at: '',
          created_at: '',
        },
      ],
    })

    expect(result.openTasks.map(item => item.id)).toEqual(['focus-task'])
    expect(result.tomorrowTasks.map(item => item.id)).toEqual(['tomorrow-task'])
    expect(result.todayEvents[0]?.id).toBe('event-today')
    expect(result.tomorrowEvents[0]?.id).toBe('event-tomorrow')
    expect(result.focusSeconds).toBe(1500)
    expect([result.habitsDone, result.habitsExpected]).toEqual([1, 1])
  })

  it('keeps tomorrow focus candidates ordered and unique', () => {
    const tomorrowTask = task('tomorrow', { due_date: '2026-06-03' })
    const result = buildTomorrowFocusCandidates(
      [tomorrowTask],
      [tomorrowTask, task('carry-over')]
    )

    expect(result.map(item => item.id)).toEqual(['tomorrow', 'carry-over'])
  })
})
