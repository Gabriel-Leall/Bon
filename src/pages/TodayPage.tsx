import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { Maximize2, Minimize2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TodayCapture } from '@/components/today/TodayCapture'
import { TodayHabits } from '@/components/today/TodayHabits'
import { TodayNow } from '@/components/today/TodayNow'
import { TodayTimeline } from '@/components/today/TodayTimeline'
import { TodayWrapUp } from '@/components/today/TodayWrapUp'
import { TodayBon } from '@/components/bon/TodayBon'
import { selectNextCommitment } from '@/lib/today-domain'
import { useCalendarStore } from '@/store/calendar-store'
import { useHabitsStore } from '@/store/habits-store'
import { getTodayISO, useTasksStore } from '@/store/tasks-store'

const dateFormatters = new Map<string, Intl.DateTimeFormat>()

function formatTodayDate(date: Date, locale: string) {
  let formatter = dateFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    dateFormatters.set(locale, formatter)
  }

  return formatter.format(date)
}

export function TodayPage() {
  const { t, i18n } = useTranslation()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const events = useCalendarStore(state => state.events)
  const loadEvents = useCalendarStore(state => state.loadEvents)
  const loadTasks = useTasksStore(state => state.loadTasks)
  const loadHabits = useHabitsStore(state => state.loadHabits)
  const loadTodayLogs = useHabitsStore(state => state.loadTodayLogs)

  useEffect(() => {
    void Promise.all([
      loadEvents(new Date()),
      loadTasks(),
      loadHabits(),
      loadTodayLogs(),
    ])
  }, [loadEvents, loadHabits, loadTasks, loadTodayLogs])

  useLayoutEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0 })
  }, [])

  const today = new Date()
  const dateLabel = formatTodayDate(today, i18n.language)
  const nextCommitment = selectNextCommitment(events, getTodayISO(), today)

  const toggleFullscreen = async () => {
    const appWindow = getCurrentWindow()
    const current = await appWindow.isFullscreen()
    await appWindow.setFullscreen(!current)
    setIsFullscreen(!current)
  }

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-auto bg-background"
    >
      <div className="mx-auto w-full max-w-(--axis-content-max) px-(--axis-page-gutter) pb-10 pt-3 sm:pt-4">
        <header className="sticky top-0 z-20 -mx-2 mb-6 flex items-start justify-between gap-4 bg-background px-2 py-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t('today.title')}
            </h1>
            <p className="text-sm capitalize text-muted-foreground">
              {dateLabel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TodayBon />
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              className="flex size-9 items-center justify-center rounded-xl border border-border-strong bg-surface text-muted-foreground shadow-neu-raised-sm transition-[background-color,color,box-shadow,transform] hover:bg-accent hover:text-accent-foreground active:translate-y-px active:shadow-neu-pressed focus-visible:shadow-focus-ring focus-visible:outline-none"
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
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </button>
          </div>
        </header>

        <div className="space-y-10">
          <TodayNow nextCommitment={nextCommitment} />
          <TodayTimeline events={events} />

          <div className="grid gap-6 lg:grid-cols-2">
            <TodayHabits />
            <TodayCapture />
          </div>

          <TodayWrapUp />
        </div>
      </div>
    </div>
  )
}
