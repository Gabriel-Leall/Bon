import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  commands,
  unwrapResult,
  type CreateEventInput as PersistedCreateEventInput,
  type UpdateEventInput as PersistedUpdateEventInput,
} from '@/lib/tauri-bindings'
import type {
  CalendarEvent,
  CreateEventInput,
  UpdateEventInput,
} from '@/lib/calendar-domain'
import { generateId, getMonthRange } from '@/lib/calendar-domain'
import { logger } from '@/lib/logger'

interface CalendarState {
  events: CalendarEvent[]
  selectedDate: string | null
  selectedEventId: string | null
  isLoading: boolean

  loadEvents: (date: Date) => Promise<void>
  loadEventsRange: (start: string, end: string) => Promise<void>
  createEvent: (
    input: Omit<CreateEventInput, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<CalendarEvent>
  updateEvent: (input: UpdateEventInput) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  setSelectedDate: (date: string | null) => void
  setSelectedEvent: (id: string | null) => void
  clearSelectedContext: () => void
}

function toPersistedCreateEventInput(
  input: CreateEventInput
): PersistedCreateEventInput {
  return {
    ...input,
    description: input.description ?? null,
    color: input.color ?? null,
  }
}

function toPersistedUpdateEventInput(
  input: UpdateEventInput
): PersistedUpdateEventInput {
  return {
    id: input.id,
    title: input.title ?? null,
    description: input.description ?? null,
    start_date: input.start_date ?? null,
    end_date: input.end_date ?? null,
    all_day: input.all_day ?? null,
    color: input.color ?? null,
    updated_at: input.updated_at,
  }
}

export const useCalendarStore = create<CalendarState>()(
  devtools(
    set => ({
      events: [],
      selectedDate: null,
      selectedEventId: null,
      isLoading: false,

      loadEvents: async (date: Date) => {
        const { start, end } = getMonthRange(date)
        await useCalendarStore.getState().loadEventsRange(start, end)
      },

      loadEventsRange: async (start, end) => {
        set({ isLoading: true }, undefined, 'loadEvents/start')
        try {
          const events = unwrapResult(await commands.getEventsRange(start, end))
          set({ events, isLoading: false }, undefined, 'loadEvents/done')
          logger.debug(`Loaded ${events.length} calendar events`)
        } catch (error) {
          logger.error(`Failed to load calendar events: ${String(error)}`)
          set({ isLoading: false }, undefined, 'loadEvents/error')
        }
      },

      createEvent: async input => {
        const now = new Date().toISOString()
        const fullInput: CreateEventInput = {
          ...input,
          id: generateId(),
          created_at: now,
          updated_at: now,
        }

        const event = unwrapResult(
          await commands.createEvent(toPersistedCreateEventInput(fullInput))
        )

        set(
          state => ({ events: [...state.events, event] }),
          false,
          'createEvent'
        )
        logger.debug(`Created calendar event: ${event.id}`)
        return event
      },

      updateEvent: async input => {
        const event = unwrapResult(
          await commands.updateEvent(toPersistedUpdateEventInput(input))
        )

        set(
          state => ({
            events: state.events.map(e => (e.id === event.id ? event : e)),
          }),
          false,
          'updateEvent'
        )
        logger.debug(`Updated calendar event: ${event.id}`)
      },

      deleteEvent: async (id: string) => {
        unwrapResult(await commands.deleteEvent(id))
        set(
          state => ({
            events: state.events.filter(e => e.id !== id),
            selectedEventId:
              state.selectedEventId === id ? null : state.selectedEventId,
          }),
          false,
          'deleteEvent'
        )
        logger.debug(`Deleted calendar event: ${id}`)
      },

      setSelectedDate: date =>
        set({ selectedDate: date }, undefined, 'setSelectedDate'),
      setSelectedEvent: id =>
        set({ selectedEventId: id }, undefined, 'setSelectedEvent'),
      clearSelectedContext: () =>
        set(
          { selectedDate: null, selectedEventId: null },
          undefined,
          'clearSelectedContext'
        ),
    }),
    { name: 'calendar-store' }
  )
)
