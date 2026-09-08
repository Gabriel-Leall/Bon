import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n/config'
import { CALENDAR_VIEW_STORAGE_KEY } from '@/lib/calendar-page-domain'
import { commands } from '@/lib/tauri-bindings'
import { useCalendarStore } from '@/store/calendar-store'
import { useTasksStore } from '@/store/tasks-store'
import { render, screen, waitFor } from '@/test/test-utils'
import { CalendarPage } from './CalendarPage'

vi.mock('@/lib/tauri-bindings', () => ({
  commands: {
    getEventsRange: vi.fn(),
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
    getTasks: vi.fn(),
    getSubtasks: vi.fn(),
    createTask: vi.fn(),
  },
  unwrapResult: vi.fn(
    (result: { status: 'ok' | 'error'; data?: unknown; error?: string }) => {
      if (result.status === 'ok') return result.data
      throw new Error(result.error ?? 'Command failed')
    }
  ),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/notifications', () => ({
  notifications: {
    error: vi.fn(),
  },
}))

describe('CalendarPage', () => {
  beforeEach(async () => {
    vi.resetAllMocks()
    window.localStorage.clear()
    await i18n.changeLanguage('en')

    vi.mocked(commands.getEventsRange).mockResolvedValue({
      status: 'ok',
      data: [],
    })
    vi.mocked(commands.getTasks).mockResolvedValue({ status: 'ok', data: [] })
    vi.mocked(commands.createTask).mockResolvedValue({
      status: 'ok',
      data: {
        id: 'created-task',
        title: 'Prepare review',
        description: null,
        priority: 'medium',
        status: 'todo',
        due_date: '2026-09-08',
        completed_at: null,
        created_at: '2026-09-08T00:00:00.000Z',
        updated_at: '2026-09-08T00:00:00.000Z',
        sort_order: 0,
      },
    })

    useCalendarStore.setState({
      events: [],
      selectedDate: null,
      selectedEventId: null,
      isLoading: false,
    })
    useTasksStore.setState({
      tasks: [],
      selectedTaskId: null,
      filters: { priority: null, status: null, search: '' },
      sectionCollapsed: {},
      isLoading: false,
    })
  })

  it('opens in the weekly planning view and loads the visible range', async () => {
    render(<CalendarPage />)

    expect(screen.getByRole('heading', { name: 'Calendar' })).toBeVisible()
    expect(screen.getByRole('radio', { name: 'Week' })).toHaveAttribute(
      'data-state',
      'on'
    )
    expect(screen.queryByRole('radio', { name: 'Day' })).not.toBeInTheDocument()

    await waitFor(() => {
      expect(commands.getEventsRange).toHaveBeenCalled()
      expect(commands.getTasks).toHaveBeenCalled()
    })
  })

  it('persists Month as the alternate overview', async () => {
    const user = userEvent.setup()
    render(<CalendarPage />)

    await user.click(screen.getByRole('radio', { name: 'Month' }))

    expect(window.localStorage.getItem(CALENDAR_VIEW_STORAGE_KEY)).toBe('month')
    expect(screen.getByRole('radio', { name: 'Month' })).toHaveAttribute(
      'data-state',
      'on'
    )
  })

  it('prefills the chosen hour when creation starts from the week grid', async () => {
    const user = userEvent.setup()
    render(<CalendarPage />)

    await waitFor(() => expect(commands.getEventsRange).toHaveBeenCalled())
    const [chosenSlot] = screen.getAllByRole('button', {
      name: /Create an item on .+ at 09:00/,
    })

    expect(chosenSlot).toBeDefined()
    if (!chosenSlot) throw new Error('Expected a 09:00 calendar slot')
    await user.click(chosenSlot)

    expect(
      screen.getByRole('dialog', { name: 'New calendar item' })
    ).toBeVisible()
    expect((screen.getByLabelText('Start') as HTMLInputElement).value).toMatch(
      /T09:00$/
    )
    expect((screen.getByLabelText('End') as HTMLInputElement).value).toMatch(
      /T10:00$/
    )
  })

  it('can create a dated task from the temporal composer', async () => {
    const user = userEvent.setup()
    render(<CalendarPage />)

    await user.click(screen.getByRole('button', { name: 'Add Event' }))
    await user.click(screen.getByRole('radio', { name: 'Task' }))
    await user.type(screen.getByLabelText('Title'), 'Prepare review')
    const chosenDate = (screen.getByLabelText('Date') as HTMLInputElement).value
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(commands.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Prepare review',
          due_date: chosenDate,
        })
      )
    })
  })
})
