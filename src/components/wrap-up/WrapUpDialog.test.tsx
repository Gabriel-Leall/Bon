import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n/config'
import { getLocalISODate } from '@/lib/calendar-domain'
import { getTomorrowISO } from '@/lib/wrap-up-domain'
import { useCalendarStore } from '@/store/calendar-store'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { useHabitsStore } from '@/store/habits-store'
import { usePomodoroStore } from '@/store/pomodoro-store'
import { type Task, useTasksStore } from '@/store/tasks-store'
import { useUIStore } from '@/store/ui-store'
import { render, screen } from '@/test/test-utils'
import { WrapUpDialog } from './WrapUpDialog'

function task(id: string, overrides: Partial<Task> = {}): Task {
  return {
    id,
    title: id,
    priority: 'medium',
    status: 'todo',
    created_at: '2026-09-01T09:00:00.000Z',
    updated_at: '2026-09-01T09:00:00.000Z',
    sort_order: 0,
    subtasks: [],
    ...overrides,
  }
}

describe('WrapUpDialog', () => {
  const today = getLocalISODate()
  const tomorrow = getTomorrowISO()

  beforeEach(async () => {
    vi.resetAllMocks()
    await i18n.changeLanguage('en')

    useCalendarStore.setState({
      events: [
        {
          id: 'today-event',
          title: 'Today review',
          description: null,
          start_date: `${today}T10:00:00`,
          end_date: `${today}T11:00:00`,
          all_day: false,
          color: null,
          created_at: '',
          updated_at: '',
        },
        {
          id: 'tomorrow-event',
          title: 'Tomorrow planning',
          description: null,
          start_date: `${tomorrow}T09:00:00`,
          end_date: `${tomorrow}T10:00:00`,
          all_day: false,
          color: null,
          created_at: '',
          updated_at: '',
        },
      ],
      loadEventsRange: vi.fn().mockResolvedValue(undefined),
    })
    useTasksStore.setState({
      tasks: [
        task('Essential follow-up', { due_date: today }),
        task('Completed today', {
          status: 'done',
          completed_at: new Date(`${today}T15:00:00`).toISOString(),
        }),
        task('Old completed item', {
          status: 'done',
          completed_at: '2026-01-01T15:00:00.000Z',
        }),
        task('Already planned tomorrow', { due_date: tomorrow }),
      ],
      loadTasks: vi.fn().mockResolvedValue(undefined),
      updateTask: vi.fn().mockResolvedValue(undefined),
    })
    useHabitsStore.setState({
      habits: [
        {
          id: 'habit',
          name: 'Walk',
          color: '#999',
          frequency: 'daily',
          active: true,
          sort_order: 0,
          created_at: '',
          updated_at: '',
        },
      ],
      todayLogs: [
        {
          id: 'habit-log',
          habit_id: 'habit',
          completed_date: today,
          completed_at: `${today}T18:00:00`,
          state: 'done',
        },
      ],
      loadHabits: vi.fn().mockResolvedValue(undefined),
      loadTodayLogs: vi.fn().mockResolvedValue(undefined),
    })
    usePomodoroStore.setState({
      todaySessions: [
        {
          id: 'focus-session',
          session_type: 'focus',
          duration_seconds: 1500,
          completed: true,
          task_id: 'Essential follow-up',
          started_at: `${today}T13:00:00`,
          created_at: `${today}T13:00:00`,
        },
      ],
      loadTodaySessions: vi.fn().mockResolvedValue(undefined),
    })
    useDailyPlanStore.setState({
      activePlan: {
        id: 'today-plan',
        plan_date: today,
        focus_task_id: 'Essential follow-up',
        status: 'open',
        focus_source: 'manual',
        created_at: `${today}T08:00:00`,
        updated_at: `${today}T08:00:00`,
        completed_at: null,
      },
    })
    useUIStore.setState({ wrapUpOpen: true })
  })

  it('shows a compact day summary and tomorrow before the final action', async () => {
    render(<WrapUpDialog />)

    expect(
      await screen.findByRole('dialog', { name: 'Wrap up the day' })
    ).toBeVisible()
    expect(screen.getByText('25 min')).toBeVisible()
    expect(screen.getByText('Tomorrow planning')).toBeVisible()
    expect(screen.getAllByText('Essential follow-up')[0]).toBeVisible()
    expect(screen.queryByText('Old completed item')).not.toBeInTheDocument()

    const tomorrowHeading = screen.getByText('Tomorrow', { selector: 'p' })
    const finish = screen.getByRole('button', {
      name: 'Move selected and finish',
    })
    expect(
      tomorrowHeading.compareDocumentPosition(finish) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it('lets the user explicitly keep a carry-over task on its current date', async () => {
    const user = userEvent.setup()
    render(<WrapUpDialog />)

    await screen.findByRole('dialog', { name: 'Wrap up the day' })
    const carryOver = screen.getByRole('button', {
      name: /Essential follow-up.*Moves to tomorrow/,
    })
    expect(carryOver).toHaveAttribute('aria-pressed', 'true')

    await user.click(carryOver)

    expect(
      screen.getByRole('button', {
        name: /Essential follow-up.*Stays on its current date/,
      })
    ).toHaveAttribute('aria-pressed', 'false')
  })
})
