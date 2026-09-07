import { cn } from '@/lib/utils'
import { AnimatePresence } from 'motion/react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BentoGrid } from '@/components/grid'
import { WidgetToggleMenu } from '@/components/grid'
import { DailyAxisBanner } from '@/components/daily-axis/DailyAxisBanner'
import { useUIStore } from '@/store/ui-store'
import { Maximize2, Minimize2 } from 'lucide-react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { lazy, Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'

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

interface MainWindowContentProps {
  children?: React.ReactNode
  className?: string
}

export function MainWindowContent({
  children,
  className,
}: MainWindowContentProps) {
  const activePage = useUIStore(state => state.activePage)
  const activePageData = useUIStore(state => state.activePageData)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { t } = useTranslation()

  const toggleFullscreen = async () => {
    const appWindow = getCurrentWindow()
    const current = await appWindow.isFullscreen()
    if (current) {
      await appWindow.setFullscreen(false)
      setIsFullscreen(false)
    } else {
      await appWindow.setFullscreen(true)
      setIsFullscreen(true)
    }
  }

  return (
    <main className={cn('flex h-full flex-col bg-background', className)}>
      {children || (
        <Suspense
          fallback={<div className="flex h-full items-center justify-center" />}
        >
          <AnimatePresence mode="wait">
            {activePage === 'tasks' ? (
              <PageWrapper key="tasks">
                <TasksPage
                  initialSelectedTaskId={activePageData['selectedTaskId']}
                />
              </PageWrapper>
            ) : activePage === 'habits' ? (
              <PageWrapper key="habits">
                <HabitPage
                  initialSelectedHabitId={activePageData['selectedHabitId']}
                />
              </PageWrapper>
            ) : activePage === 'focus' ? (
              <PageWrapper key="focus">
                <FocusPage />
              </PageWrapper>
            ) : activePage === 'notes' ? (
              <PageWrapper key="notes">
                <NotesPage
                  initialSelectedNoteId={activePageData['selectedNoteId']}
                />
              </PageWrapper>
            ) : activePage === 'calendar' ? (
              <PageWrapper key="calendar">
                <CalendarPage />
              </PageWrapper>
            ) : activePage === 'analysis' ? (
              <PageWrapper key="analysis">
                <AnalysisPage />
              </PageWrapper>
            ) : (
              <PageWrapper key="today">
                <div className="flex h-full flex-col">
                  <div className="flex shrink-0 items-center justify-end gap-1 border-b border-border px-4 py-1.5">
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="flex size-7 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      aria-label={t(
                        isFullscreen
                          ? 'navigation.exitFullscreen'
                          : 'navigation.enterFullscreen'
                      )}
                      title={t(
                        isFullscreen
                          ? 'navigation.exitFullscreen'
                          : 'navigation.enterFullscreen'
                      )}
                    >
                      {isFullscreen ? (
                        <Minimize2 className="size-3.5" />
                      ) : (
                        <Maximize2 className="size-3.5" />
                      )}
                    </button>
                    <WidgetToggleMenu />
                  </div>

                  <div className="relative min-w-0 flex-1 overflow-hidden">
                    <DailyAxisBanner />
                    <BentoGrid />
                  </div>
                </div>
              </PageWrapper>
            )}
          </AnimatePresence>
        </Suspense>
      )}
    </main>
  )
}
