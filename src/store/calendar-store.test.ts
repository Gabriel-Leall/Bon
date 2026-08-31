import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCalendarStore } from './calendar-store'
import { commands } from '@/lib/tauri-bindings'
import type { CalendarEvent } from '@/lib/calendar-domain'

vi.mock('@/lib/tauri-bindings', () => ({
  commands: {
    getEventsRange: vi.fn(),
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
  },
  unwrapResult: vi.fn(
    (result: { status: string; data?: unknown; error?: unknown }) => {
      if (result.status === 'ok') return result.data
      throw result.error
    }
  ),
}))

// We also mock logger to avoid cluttering test output
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('CalendarStore', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    useCalendarStore.setState({
      events: [],
      selectedDate: null,
      selectedEventId: null,
      isLoading: false,
    })
  })

  it('has correct initial state', () => {
    const state = useCalendarStore.getState()
    expect(state.events).toEqual([])
    expect(state.selectedDate).toBeNull()
    expect(state.selectedEventId).toBeNull()
    expect(state.isLoading).toBe(false)
  })

  it('loads events', async () => {
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Test Event',
        description: null,
        start_date: '2023-10-01',
        end_date: '2023-10-02',
        all_day: true,
        color: null,
        created_at: '2023-10-01T00:00:00.000Z',
        updated_at: '2023-10-01T00:00:00.000Z',
      },
    ]

    vi.mocked(commands.getEventsRange).mockResolvedValue({
      status: 'ok',
      data: mockEvents,
    })

    const { loadEvents } = useCalendarStore.getState()
    await loadEvents(new Date(2023, 9, 15)) // Oct 15

    const state = useCalendarStore.getState()
    expect(state.isLoading).toBe(false)
    expect(state.events).toEqual(mockEvents)
    // Check that it was called with correct date strings for Oct 2023
    expect(commands.getEventsRange).toHaveBeenCalledWith(
      '2023-10-01',
      '2023-10-31'
    )
  })

  it('creates an event', async () => {
    const mockEvent: CalendarEvent = {
      id: '2',
      title: 'New Event',
      description: null,
      start_date: '2023-10-15',
      end_date: '2023-10-16',
      all_day: true,
      color: null,
      created_at: '2023-10-10T00:00:00.000Z',
      updated_at: '2023-10-10T00:00:00.000Z',
    }

    vi.mocked(commands.createEvent).mockResolvedValue({
      status: 'ok',
      data: mockEvent,
    })

    const { createEvent } = useCalendarStore.getState()
    const result = await createEvent({
      title: 'New Event',
      start_date: '2023-10-15',
      end_date: '2023-10-16',
      all_day: true,
    })

    const state = useCalendarStore.getState()
    expect(result).toEqual(mockEvent)
    expect(state.events).toContainEqual(mockEvent)
    expect(commands.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ description: null, color: null })
    )
  })

  it('updates an event', async () => {
    const initialEvent: CalendarEvent = {
      id: '3',
      title: 'Old Title',
      description: null,
      start_date: '2023-10-15',
      end_date: '2023-10-16',
      all_day: true,
      color: null,
      created_at: '2023-10-10T00:00:00.000Z',
      updated_at: '2023-10-10T00:00:00.000Z',
    }

    useCalendarStore.setState({ events: [initialEvent] })

    const updatedEvent: CalendarEvent = {
      ...initialEvent,
      title: 'New Title',
      updated_at: '2023-10-12T00:00:00.000Z',
    }

    vi.mocked(commands.updateEvent).mockResolvedValue({
      status: 'ok',
      data: updatedEvent,
    })

    const { updateEvent } = useCalendarStore.getState()
    await updateEvent({
      id: '3',
      title: 'New Title',
      updated_at: '2023-10-12T00:00:00.000Z',
    })

    const state = useCalendarStore.getState()
    expect(state.events[0]?.title).toBe('New Title')
    expect(commands.updateEvent).toHaveBeenCalledWith({
      id: '3',
      title: 'New Title',
      description: null,
      start_date: null,
      end_date: null,
      all_day: null,
      color: null,
      updated_at: '2023-10-12T00:00:00.000Z',
    })
  })

  it('deletes an event and clears selection if selected', async () => {
    const event: CalendarEvent = {
      id: '4',
      title: 'To Delete',
      description: null,
      start_date: '2023-10-15',
      end_date: '2023-10-16',
      all_day: true,
      color: null,
      created_at: '2023-10-10T00:00:00.000Z',
      updated_at: '2023-10-10T00:00:00.000Z',
    }

    useCalendarStore.setState({ events: [event], selectedEventId: '4' })

    vi.mocked(commands.deleteEvent).mockResolvedValue({
      status: 'ok',
      data: null,
    })

    const { deleteEvent } = useCalendarStore.getState()
    await deleteEvent('4')

    const state = useCalendarStore.getState()
    expect(state.events).toEqual([])
    expect(state.selectedEventId).toBeNull()
    expect(commands.deleteEvent).toHaveBeenCalledWith('4')
  })

  it('keeps the event when deletion fails', async () => {
    const event: CalendarEvent = {
      id: '5',
      title: 'Protected event',
      description: null,
      start_date: '2023-10-15',
      end_date: '2023-10-16',
      all_day: true,
      color: null,
      created_at: '2023-10-10T00:00:00.000Z',
      updated_at: '2023-10-10T00:00:00.000Z',
    }
    useCalendarStore.setState({ events: [event], selectedEventId: '5' })
    vi.mocked(commands.deleteEvent).mockResolvedValue({
      status: 'error',
      error: 'Deletion failed',
    })

    await expect(useCalendarStore.getState().deleteEvent('5')).rejects.toBe(
      'Deletion failed'
    )

    expect(useCalendarStore.getState().events).toEqual([event])
    expect(useCalendarStore.getState().selectedEventId).toBe('5')
  })
})
