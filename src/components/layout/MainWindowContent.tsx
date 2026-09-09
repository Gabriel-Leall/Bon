import { cn } from '@/lib/utils'
import { AnimatePresence } from 'motion/react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useUIStore, type AppPage } from '@/store/ui-store'
import { lazy, Suspense } from 'react'

const TasksPage = lazy(() =>
  import('@/pages/TasksPage').then(module => ({ default: module.TasksPage }))
)
const FocusPage = lazy(() =>
  import('@/pages/PomodoroPage').then(module => ({
    default: module.PomodoroPage,
  }))
)
const HabitPage = lazy(() =>
  import('@/pages/HabitPage').then(module => ({ default: module.HabitPage }))
)
const NotesPage = lazy(() =>
  import('@/pages/NotesPage').then(module => ({ default: module.NotesPage }))
)
const CalendarPage = lazy(() =>
  import('@/pages/CalendarPage').then(module => ({
    default: module.CalendarPage,
  }))
)
const AnalysisPage = lazy(() => import('@/pages/AnalyticsPage'))
const TodayPage = lazy(() =>
  import('@/pages/TodayPage').then(module => ({ default: module.TodayPage }))
)

interface MainWindowContentProps {
  children?: React.ReactNode
  className?: string
}

function ActivePageContent({
  activePage,
  activePageData,
}: {
  activePage: AppPage
  activePageData: Record<string, string>
}) {
  switch (activePage) {
    case 'tasks':
      return <TasksPage initialSelectedTaskId={activePageData.selectedTaskId} />
    case 'habits':
      return (
        <HabitPage initialSelectedHabitId={activePageData.selectedHabitId} />
      )
    case 'focus':
      return <FocusPage />
    case 'notes':
      return <NotesPage initialSelectedNoteId={activePageData.selectedNoteId} />
    case 'calendar':
      return <CalendarPage />
    case 'analysis':
      return <AnalysisPage />
    case 'today':
      return <TodayPage />
  }
}

export function MainWindowContent({
  children,
  className,
}: MainWindowContentProps) {
  const activePage = useUIStore(state => state.activePage)
  const activePageData = useUIStore(state => state.activePageData)

  return (
    <main className={cn('flex h-full flex-col bg-background', className)}>
      {children || (
        <Suspense
          fallback={<div className="flex h-full items-center justify-center" />}
        >
          <AnimatePresence mode="wait">
            <PageWrapper key={activePage}>
              <ActivePageContent
                activePage={activePage}
                activePageData={activePageData}
              />
            </PageWrapper>
          </AnimatePresence>
        </Suspense>
      )}
    </main>
  )
}
