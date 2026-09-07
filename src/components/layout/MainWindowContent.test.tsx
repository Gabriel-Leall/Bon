import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import i18n from '@/i18n/config'
import { useUIStore, type AppPage } from '@/store/ui-store'
import { MainWindowContent } from './MainWindowContent'

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('@/components/layout/PageWrapper', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => (
    <section>{children}</section>
  ),
}))

vi.mock('@/components/grid', () => ({
  BentoGrid: () => <div data-testid="today-page" />,
  WidgetToggleMenu: () => <button type="button">Widgets</button>,
}))

vi.mock('@/components/daily-axis/DailyAxisBanner', () => ({
  DailyAxisBanner: () => <div data-testid="daily-axis-banner" />,
}))

vi.mock('@/pages/TasksPage', () => ({
  TasksPage: ({
    initialSelectedTaskId,
  }: {
    initialSelectedTaskId?: string
  }) => (
    <div data-selected-id={initialSelectedTaskId} data-testid="tasks-page" />
  ),
}))

vi.mock('@/pages/PomodoroPage', () => ({
  PomodoroPage: () => <div data-testid="focus-page" />,
}))

vi.mock('@/pages/HabitPage', () => ({
  HabitPage: () => <div data-testid="habits-page" />,
}))

vi.mock('@/pages/NotesPage', () => ({
  NotesPage: () => <div data-testid="notes-page" />,
}))

vi.mock('@/pages/CalendarPage', () => ({
  CalendarPage: () => <div data-testid="calendar-page" />,
}))

vi.mock('@/pages/AnalyticsPage', () => ({
  default: () => <div data-testid="analysis-page" />,
}))

describe('MainWindowContent', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR')
    useUIStore.setState({ activePage: 'today', activePageData: {} })
  })

  it.each([
    ['today', 'today-page'],
    ['tasks', 'tasks-page'],
    ['notes', 'notes-page'],
    ['calendar', 'calendar-page'],
    ['habits', 'habits-page'],
    ['focus', 'focus-page'],
    ['analysis', 'analysis-page'],
  ] as const)(
    'dispatches the canonical %s destination',
    async (page: AppPage, testId) => {
      useUIStore.setState({ activePage: page, activePageData: {} })

      render(<MainWindowContent />)

      expect(await screen.findByTestId(testId)).toBeInTheDocument()
    }
  )

  it('forwards navigation payloads to a destination page', async () => {
    useUIStore.setState({
      activePage: 'tasks',
      activePageData: { selectedTaskId: 'task-42' },
    })

    render(<MainWindowContent />)

    expect(await screen.findByTestId('tasks-page')).toHaveAttribute(
      'data-selected-id',
      'task-42'
    )
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
