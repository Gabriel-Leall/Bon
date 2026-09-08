import { Check, Circle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  selectSortedTodayHabits,
  selectTodayProgress,
  useHabitsStore,
} from '@/store/habits-store'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/ui-store'

export function TodayHabits() {
  const { t } = useTranslation()
  const habits = useHabitsStore(state => state.habits)
  const todayLogs = useHabitsStore(state => state.todayLogs)
  const toggleHabit = useHabitsStore(state => state.toggleHabit)
  const setSelectedHabit = useHabitsStore(state => state.setSelectedHabit)
  const navigateTo = useUIStore(state => state.navigateTo)
  const todayHabits = selectSortedTodayHabits(habits, todayLogs).slice(0, 5)
  const progress = selectTodayProgress(habits, todayLogs)

  return (
    <section
      aria-labelledby="today-habits-heading"
      className="rounded-2xl border border-border bg-surface p-5 shadow-neu-raised"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2
            id="today-habits-heading"
            className="text-lg font-semibold tracking-tight"
          >
            {t('today.habits.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('today.habits.progress', {
              done: progress.done,
              total: progress.total,
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigateTo('habits')}
          className="rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:shadow-focus-ring focus-visible:outline-none"
        >
          {t('today.habits.manage')}
        </button>
      </div>

      <div className="mt-5 divide-y divide-border">
        {todayHabits.length === 0 ? (
          <div className="flex min-h-28 items-center justify-center text-center text-sm text-muted-foreground">
            {t('today.habits.empty')}
          </div>
        ) : (
          todayHabits.map(habit => {
            const done = todayLogs.some(log => log.habit_id === habit.id)
            return (
              <div
                key={habit.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full border border-border shadow-neu-raised-sm"
                  style={{ backgroundColor: habit.color }}
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedHabit(habit.id)
                    navigateTo('habits', { selectedHabitId: habit.id })
                  }}
                  className="min-w-0 flex-1 truncate rounded-sm text-left text-sm font-medium focus-visible:shadow-focus-ring focus-visible:outline-none"
                >
                  {habit.name}
                </button>
                <button
                  type="button"
                  onClick={() => void toggleHabit(habit.id)}
                  aria-label={t(
                    done
                      ? 'widgets.habits.markUndoneAria'
                      : 'widgets.habits.markDoneAria'
                  )}
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-xl border shadow-neu-raised-sm transition-[background-color,border-color,color,box-shadow,transform] active:translate-y-px active:shadow-neu-pressed focus-visible:shadow-focus-ring focus-visible:outline-none',
                    done
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border-strong bg-surface text-muted-foreground hover:border-primary hover:text-primary'
                  )}
                >
                  {done ? (
                    <Check className="size-4" strokeWidth={2.5} />
                  ) : (
                    <Circle className="size-4" />
                  )}
                </button>
              </div>
            )
          })
        )}
      </div>

      {progress.total > 0 ? (
        <div
          className="mt-5 h-2 overflow-hidden rounded-full bg-surface-sunken shadow-neu-pressed"
          role="progressbar"
          aria-label={t('today.habits.title')}
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-valuenow={progress.done}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${progress.ratio * 100}%` }}
          />
        </div>
      ) : null}
    </section>
  )
}
