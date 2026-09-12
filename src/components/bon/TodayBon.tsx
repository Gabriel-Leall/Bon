import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getTodayBonState } from '@/lib/bon-domain'
import { commands, type AppPreferences } from '@/lib/tauri-bindings'
import { getTodayISO, useTasksStore } from '@/store/tasks-store'
import { useHabitsStore } from '@/store/habits-store'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { preferencesQueryKeys, usePreferences } from '@/services/preferences'
import { BonCompanion } from './BonCompanion'

export function TodayBon() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: preferences } = usePreferences()
  const activePlan = useDailyPlanStore(state => state.activePlan)
  const persistedEncounter = useRef(false)
  const previousCounts = useRef<{
    completedHabits: number
    completedTasks: number
    recoveredHabits: number
    tasks: number
  } | null>(null)
  const reactionTimer = useRef<number | null>(null)
  const [now, setNow] = useState(() => new Date())
  const [reaction, setReaction] = useState<
    'celebrate' | 'curious' | 'happy' | null
  >(null)
  const tasks = useTasksStore(state => state.tasks)
  const todayLogs = useHabitsStore(state => state.todayLogs)
  const todayISO = getTodayISO()
  const introSeen = preferences?.buddy_intro_seen ?? false
  const lastSeenDate = preferences?.buddy_last_seen_date ?? null
  const state = getTodayBonState({
    introSeen,
    lastSeenDate,
    now,
    planWrappedUp: activePlan?.status === 'wrapped_up',
    todayISO,
    wrapUpTime: preferences?.daily_wrap_up_reminder_time ?? '18:00',
  })

  useEffect(() => {
    if (
      !preferences ||
      preferences.buddy_enabled === false ||
      persistedEncounter.current ||
      (preferences.buddy_intro_seen &&
        preferences.buddy_last_seen_date === todayISO)
    ) {
      return
    }

    persistedEncounter.current = true
    const updated: AppPreferences = {
      ...preferences,
      buddy_intro_seen: true,
      buddy_last_seen_date: todayISO,
    }
    const timer = window.setTimeout(() => {
      void commands.savePreferences(updated).then(result => {
        if (result.status === 'ok') {
          queryClient.setQueryData(preferencesQueryKeys.preferences(), updated)
        }
      })
    }, 7500)

    return () => window.clearTimeout(timer)
  }, [preferences, queryClient, todayISO])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const counts = {
      completedHabits: todayLogs.filter(log => log.state !== 'paused').length,
      completedTasks: tasks.filter(
        task => task.status === 'done' || Boolean(task.completed_at)
      ).length,
      recoveredHabits: todayLogs.filter(log => log.state === 'recovered')
        .length,
      tasks: tasks.length,
    }
    const previous = previousCounts.current
    previousCounts.current = counts
    if (!previous) return

    let nextReaction: typeof reaction = null
    if (counts.recoveredHabits > previous.recoveredHabits) {
      nextReaction = 'celebrate'
    } else if (counts.completedHabits > previous.completedHabits) {
      nextReaction = 'happy'
    } else if (counts.completedTasks > previous.completedTasks) {
      nextReaction = 'happy'
    } else if (counts.tasks > previous.tasks) {
      nextReaction = 'curious'
    }
    if (!nextReaction) return

    setReaction(nextReaction)
    if (reactionTimer.current !== null) {
      window.clearTimeout(reactionTimer.current)
    }
    reactionTimer.current = window.setTimeout(() => setReaction(null), 1400)
  }, [tasks, todayLogs])

  useEffect(
    () => () => {
      if (reactionTimer.current !== null) {
        window.clearTimeout(reactionTimer.current)
      }
    },
    []
  )

  return (
    <BonCompanion
      variant="compact"
      state={reaction ?? state}
      message={!introSeen ? t('bon.introduction') : undefined}
      messageKey={!introSeen ? 'first-introduction' : undefined}
    />
  )
}
