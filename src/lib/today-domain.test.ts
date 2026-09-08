import { describe, expect, it } from 'vitest'
import type { CalendarEvent } from '@/lib/calendar-domain'
import type { Task } from '@/store/tasks-store'
import {
  buildTodayTimeline,
  selectNextCommitment,
  selectTodayOpenTasks,
} from './today-domain'

const baseTask: Task = {
  id: 'task-1',
  title: 'Escrever proposta',
  priority: 'high',
  status: 'todo',
  due_date: '2026-09-08',
  created_at: '2026-09-08T08:00:00.000Z',
  updated_at: '2026-09-08T08:00:00.000Z',
  sort_order: 1,
  subtasks: [],
}

const baseEvent: CalendarEvent = {
  id: 'event-1',
  title: 'Reunião de produto',
  description: null,
  start_date: '2026-09-08T15:00:00.000Z',
  end_date: '2026-09-08T16:00:00.000Z',
  all_day: false,
  color: null,
  created_at: '2026-09-08T08:00:00.000Z',
  updated_at: '2026-09-08T08:00:00.000Z',
}

describe('today domain', () => {
  it('keeps only open tasks that belong to today or have no date', () => {
    const tasks: Task[] = [
      baseTask,
      { ...baseTask, id: 'inbox', due_date: undefined, sort_order: 0 },
      { ...baseTask, id: 'tomorrow', due_date: '2026-09-09' },
      { ...baseTask, id: 'done', status: 'done' },
    ]

    expect(
      selectTodayOpenTasks(tasks, '2026-09-08').map(task => task.id)
    ).toEqual(['inbox', 'task-1'])
  })

  it('selects the next unfinished timed commitment', () => {
    const events = [
      {
        ...baseEvent,
        id: 'past',
        start_date: '2026-09-08T10:00:00.000Z',
        end_date: '2026-09-08T11:00:00.000Z',
      },
      baseEvent,
    ]

    expect(
      selectNextCommitment(
        events,
        '2026-09-08',
        new Date('2026-09-08T12:00:00.000Z')
      )?.id
    ).toBe('event-1')
  })

  it('places events before unscheduled task actions in the daily sequence', () => {
    const timeline = buildTodayTimeline([baseEvent], [baseTask], '2026-09-08')

    expect(timeline.map(item => item.kind)).toEqual(['event', 'task'])
  })
})
