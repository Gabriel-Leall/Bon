import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Coffee,
  Zap,
  Settings2,
} from 'lucide-react'
import { usePomodoroStore } from '@/store/pomodoro-store'
import { useTasksStore, selectTodayTasks } from '@/store/tasks-store'
import type {
  PomodoroSession,
  PomodoroSettings,
  SessionType,
} from '@/store/pomodoro-types'
import { cn } from '@/lib/utils'
import { LazyMotion, domAnimation, m } from 'motion/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  isPermissionGranted,
  requestPermission,
} from '@tauri-apps/plugin-notification'
import { notifications } from '@/lib/notifications'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(Math.max(0, seconds) / 60)
  const s = Math.floor(Math.max(0, seconds) % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function typeLabel(type: SessionType, t: (k: string) => string): string {
  switch (type) {
    case 'focus':
      return t('pomodoro.session.focus')
    case 'short_break':
      return t('pomodoro.session.shortBreak')
    case 'long_break':
      return t('pomodoro.session.longBreak')
  }
}

function formatSessionTime(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (s === 0) return `${m}m`
  return `${m}m ${s}s`
}

// ─── Auto-Start Badge ─────────────────────────────────────────────────────────

function AutoStartBadge({
  currentType,
  autoStartBreaks,
  autoStartFocus,
}: {
  currentType: SessionType
  autoStartBreaks: boolean
  autoStartFocus: boolean
}) {
  const { t } = useTranslation()
  const nextWillAutoStart =
    currentType === 'focus' ? autoStartBreaks : autoStartFocus
  const nextType =
    currentType === 'focus'
      ? t('pomodoro.session.shortBreak')
      : t('pomodoro.session.focus')

  if (!nextWillAutoStart) return null

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-neu-raised-sm">
      <Zap className="size-3 shrink-0 text-primary" strokeWidth={2} />
      <span>{t('pomodoro.autoStart', { type: nextType })}</span>
    </div>
  )
}

// ─── Cycle Dots Large ─────────────────────────────────────────────────────────

function CycleDotsLarge({
  completed,
  total,
}: {
  completed: number
  total: number
}) {
  const { t } = useTranslation()
  const cyclePos = completed % total
  const dots = Array.from({ length: total }, (_, i) => ({
    id: `cycle-dot-${total}-${i}`,
    filled: i < cyclePos || (completed > 0 && cyclePos === 0 && i < total),
  }))

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex items-center gap-2"
        aria-label={`${cyclePos || total} of ${total}`}
      >
        {dots.map(dot => (
          <m.div
            key={dot.id}
            initial={false}
            animate={{
              scale: dot.filled ? 1 : 0.85,
              opacity: dot.filled ? 1 : 0.3,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={cn(
              'size-2.5 rounded-full border border-border transition-[background-color,box-shadow]',
              dot.filled
                ? 'bg-primary shadow-neu-raised-sm'
                : 'bg-surface-sunken shadow-neu-pressed'
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {t('pomodoro.cycleLabel', { current: cyclePos || total, total })}
      </span>
    </div>
  )
}

// ─── Circular Timer ──────────────────────────────────────────────────────────

const TIMER_RING_RADIUS = 44
const TIMER_RING_CIRCUMFERENCE = 2 * Math.PI * TIMER_RING_RADIUS
const TIMER_ORBIT_DEGREES_PER_SECOND = 4

function CircularTimer({
  currentType,
  timeRemaining,
  totalDuration,
  progress,
  isRunning,
  cyclesCompleted,
  pomosUntilLongBreak,
  autoStartBreaks,
  autoStartFocus,
}: {
  currentType: SessionType
  timeRemaining: number
  totalDuration: number
  progress: number
  isRunning: boolean
  cyclesCompleted: number
  pomosUntilLongBreak: number
  autoStartBreaks: boolean
  autoStartFocus: boolean
}) {
  const { t } = useTranslation()
  const progressPercent = Math.max(0, Math.min(100, progress * 100))
  const progressOffset = TIMER_RING_CIRCUMFERENCE * (1 - progressPercent / 100)
  const elapsedSeconds = Math.max(0, totalDuration - timeRemaining)
  const orbitAngle = elapsedSeconds * TIMER_ORBIT_DEGREES_PER_SECOND
  const orbitStyle = {
    '--timer-orbit-angle': `${orbitAngle}deg`,
  } as CSSProperties

  return (
    <div className="mt-7 flex flex-col items-center gap-4">
      <div
        className="relative grid aspect-square w-full max-w-sm place-items-center rounded-full border border-border bg-surface-sunken p-5 shadow-neu-pressed sm:p-7"
        role="progressbar"
        aria-label={t('pomodoro.controls.timeRemaining', {
          time: formatTime(timeRemaining),
        })}
        aria-valuenow={Math.round(progressPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 100 100"
            className="size-full -rotate-90 p-3 sm:p-4"
          >
            <circle
              cx="50"
              cy="50"
              r={TIMER_RING_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-border-strong"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        <div
          className="timer-progress-orbit pointer-events-none absolute inset-0"
          data-running={isRunning}
          style={orbitStyle}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 100 100"
            className="size-full -rotate-90 p-3 sm:p-4"
          >
            <circle
              cx="50"
              cy="50"
              r={TIMER_RING_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={TIMER_RING_CIRCUMFERENCE}
              strokeDashoffset={progressOffset}
              className="text-primary transition-[stroke-dashoffset] duration-1000 ease-linear motion-reduce:transition-none"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="18 32"
              className="text-primary/55"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        <div className="relative z-10 flex aspect-square w-5/6 flex-col items-center justify-center rounded-full border border-border bg-surface px-5 shadow-neu-raised-sm">
          <div
            className={cn(
              'font-mono text-6xl leading-none tabular-nums tracking-tighter transition-colors sm:text-7xl',
              currentType === 'focus'
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}
          >
            <span aria-live="polite" aria-atomic="true">
              {formatTime(timeRemaining)}
            </span>
          </div>

          <div className="mt-6">
            <CycleDotsLarge
              completed={cyclesCompleted}
              total={pomosUntilLongBreak}
            />
          </div>
        </div>
      </div>

      <div className="flex min-h-7 items-center justify-center">
        <AutoStartBadge
          currentType={currentType}
          autoStartBreaks={autoStartBreaks}
          autoStartFocus={autoStartFocus}
        />
      </div>
    </div>
  )
}

// ─── Task Link Section ────────────────────────────────────────────────────────

function TaskLinkSection() {
  const { t } = useTranslation()
  const linkedTaskId = usePomodoroStore(state => state.linkedTaskId)
  const linkTask = usePomodoroStore(state => state.linkTask)
  const unlinkTask = usePomodoroStore(state => state.unlinkTask)

  const tasks = useTasksStore(state => state.tasks)
  const todayTasks = selectTodayTasks(tasks)
  const linkedTask = linkedTaskId
    ? tasks.find(task => task.id === linkedTaskId)
    : null

  const [showPicker, setShowPicker] = useState(false)
  const [search, setSearch] = useState('')
  const pickerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!showPicker) return
    const handler = (e: MouseEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) {
        setShowPicker(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPicker])

  const normalizedSearch = search.toLowerCase()
  const filtered = todayTasks.filter(
    task =>
      task.title.toLowerCase().includes(normalizedSearch) &&
      task.id !== linkedTaskId
  )

  useEffect(() => {
    if (!linkedTaskId) return
    if (linkedTask) return

    unlinkTask()
    void notifications.info(
      t('pomodoro.linkedTask.removedTitle'),
      t('pomodoro.linkedTask.removedDescription')
    )
  }, [linkedTaskId, linkedTask, unlinkTask, t])

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-neu-raised">
      <h2 className="text-sm font-semibold">
        {t('pomodoro.linkedTask.heading')}
      </h2>

      {linkedTask ? (
        <div className="group mt-4 flex items-center gap-3 rounded-xl border border-border-strong bg-surface-sunken p-3 shadow-neu-pressed">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-neu-raised-sm">
            <CheckCircle2 className="size-3.5" strokeWidth={2.5} />
          </div>
          <span className="flex-1 truncate text-sm font-medium">
            {linkedTask.title}
          </span>
          <button
            type="button"
            onClick={unlinkTask}
            aria-label={t('pomodoro.linkedTask.unlinkAria')}
            className="flex size-7 items-center justify-center rounded-full border border-border-strong bg-surface text-muted-foreground opacity-0 shadow-neu-raised-sm transition-[background-color,color,opacity,box-shadow] hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100 focus-visible:opacity-100 focus-visible:shadow-focus-ring focus-visible:outline-none"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          {t('pomodoro.linkedTask.none')}
        </p>
      )}

      {/* Task picker */}
      <div className="relative mt-3" ref={pickerRef}>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => {
            const next = !showPicker
            setShowPicker(next)
            if (next) {
              requestAnimationFrame(() => searchInputRef.current?.focus())
            }
          }}
        >
          <Plus className="size-3.5" />
          {t('pomodoro.linkedTask.linkButton')}
        </Button>

        {showPicker ? (
          <div className="absolute top-full left-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border-strong bg-popover shadow-neu-raised animate-in fade-in zoom-in-95">
            <div className="border-b border-border bg-surface-sunken px-3 py-2.5 shadow-neu-pressed">
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('pomodoro.linkedTask.searchPlaceholder')}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground focus-visible:shadow-focus-input"
              />
            </div>
            <div className="max-h-56 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  {t('pomodoro.linkedTask.noResults')}
                </div>
              ) : (
                filtered.slice(0, 10).map(task => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => {
                      linkTask(task.id)
                      setShowPicker(false)
                      setSearch('')
                    }}
                    className="flex w-full items-center px-4 py-2.5 text-start text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none"
                  >
                    <span className="truncate">{task.title}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

// ─── Session History ──────────────────────────────────────────────────────────

function SessionIcon({ type }: { type: SessionType }) {
  if (type === 'focus')
    return <Clock className="size-4 text-primary" strokeWidth={2} />
  return <Coffee className="size-4 text-muted-foreground" strokeWidth={2} />
}

function SessionHistorySection({ sessions }: { sessions: PomodoroSession[] }) {
  const { t } = useTranslation()
  const tasks = useTasksStore(state => state.tasks)
  const completedFocus = sessions.filter(
    s => s.session_type === 'focus' && s.completed
  ).length

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-neu-raised">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          {t('pomodoro.history.heading')}
        </h2>
        {completedFocus > 0 ? (
          <span className="inline-flex items-center rounded-full border border-border bg-surface-sunken px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-neu-pressed">
            {t('pomodoro.history.pomosCount', { count: completedFocus })}
          </span>
        ) : null}
      </div>

      {sessions.length === 0 ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-surface-sunken px-4 py-5 shadow-neu-pressed">
          <span className="flex size-9 items-center justify-center rounded-full border border-border-strong bg-surface text-muted-foreground shadow-neu-raised-sm">
            <Clock className="size-4" />
          </span>
          <span className="text-sm text-muted-foreground">
            {t('pomodoro.history.empty')}
          </span>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface-sunken shadow-neu-pressed">
          {sessions.map(session => {
            const task = session.task_id
              ? tasks.find(task => task.id === session.task_id)
              : null

            return (
              <div
                key={session.id}
                className={cn(
                  'flex items-center gap-3 border-b border-border px-3 py-3 text-sm last:border-b-0',
                  session.completed
                    ? 'bg-transparent'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface shadow-neu-raised-sm">
                  <SessionIcon type={session.session_type} />
                </div>
                <div className="flex flex-1 flex-col overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {typeLabel(session.session_type, t)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      • {formatDuration(session.duration_seconds)}
                    </span>
                  </div>
                  {task ? (
                    <span className="truncate text-xs text-muted-foreground">
                      {task.title}
                    </span>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                  <span className="font-mono text-xs font-medium text-muted-foreground">
                    {formatSessionTime(session.started_at)}
                  </span>
                  {!session.completed ? (
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {t('pomodoro.history.inProgress')}
                    </span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

// ─── Settings Section ─────────────────────────────────────────────────────────

function NumberInput({
  value,
  onChange,
  min = 1,
  max = 120,
  label,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  label: string
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      aria-label={label}
      onChange={e => {
        const rawValue = e.target.value
        if (!rawValue) return
        const nextValue = Number(rawValue)
        if (
          Number.isFinite(nextValue) &&
          nextValue >= min &&
          nextValue <= max
        ) {
          onChange(nextValue)
        }
      }}
      className="w-16 rounded-lg border border-border-strong bg-surface px-2.5 py-1.5 text-center text-sm font-medium tabular-nums shadow-neu-raised-sm outline-none transition-[border-color,box-shadow] focus:border-primary focus:shadow-focus-input"
    />
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border-strong bg-surface-sunken shadow-neu-pressed transition-[background-color,border-color,box-shadow] focus-visible:shadow-focus-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-muted disabled:text-foreground-disabled disabled:shadow-none',
        checked && 'border-primary bg-primary'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block size-5 rounded-full border border-border bg-surface-elevated shadow-neu-raised-sm ring-0 transition-transform duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  )
}

function SettingsSection({
  settings,
  onUpdate,
}: {
  settings: PomodoroSettings
  onUpdate: (updates: Partial<PomodoroSettings>) => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const rows: {
    label: string
    unit?: string
    type: 'number' | 'toggle'
    key: keyof PomodoroSettings
    min?: number
    max?: number
  }[] = [
    {
      label: t('pomodoro.settings.focusDuration'),
      unit: t('pomodoro.settings.unitMin'),
      type: 'number',
      key: 'focus_duration',
      min: 1,
      max: 120,
    },
    {
      label: t('pomodoro.settings.shortBreak'),
      unit: t('pomodoro.settings.unitMin'),
      type: 'number',
      key: 'short_break_duration',
      min: 1,
      max: 60,
    },
    {
      label: t('pomodoro.settings.longBreak'),
      unit: t('pomodoro.settings.unitMin'),
      type: 'number',
      key: 'long_break_duration',
      min: 1,
      max: 120,
    },
    {
      label: t('pomodoro.settings.pomosUntilLongBreak'),
      type: 'number',
      key: 'pomos_until_long_break',
      min: 1,
      max: 12,
    },
    {
      label: t('pomodoro.settings.autoStartBreaks'),
      type: 'toggle',
      key: 'auto_start_breaks',
    },
    {
      label: t('pomodoro.settings.autoStartFocus'),
      type: 'toggle',
      key: 'auto_start_focus',
    },
    {
      label: t('pomodoro.settings.soundNotifications'),
      type: 'toggle',
      key: 'sound_notifications',
    },
  ]

  return (
    <section className="rounded-2xl border border-border bg-surface p-3 shadow-neu-raised">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="group flex w-full items-center justify-between rounded-xl border border-transparent px-2 py-2 text-start transition-[background-color,border-color,box-shadow] hover:border-border hover:bg-surface-elevated focus-visible:shadow-focus-ring focus-visible:outline-none"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Settings2 className="size-4" />
          {t('pomodoro.settings.heading')}
        </span>
        <span className="rounded-full border border-border bg-surface-sunken p-1 shadow-neu-pressed">
          {open ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </span>
      </button>

      {open ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-surface-sunken shadow-neu-pressed animate-in fade-in slide-in-from-top-2">
          {rows.map(row => (
            <div
              key={row.key}
              className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0"
            >
              <span className="text-sm font-medium text-foreground">
                {row.label}
              </span>
              <div className="flex items-center gap-2">
                {row.type === 'number' ? (
                  <>
                    <NumberInput
                      value={settings[row.key] as number}
                      onChange={v => onUpdate({ [row.key]: v })}
                      min={row.min}
                      max={row.max}
                      label={row.label}
                    />
                    {row.unit ? (
                      <span className="w-8 text-xs font-medium text-muted-foreground">
                        {row.unit}
                      </span>
                    ) : null}
                  </>
                ) : (
                  <div className="flex h-8 items-center pr-2">
                    <Toggle
                      checked={settings[row.key] as boolean}
                      onChange={v => onUpdate({ [row.key]: v })}
                      label={row.label}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

// ─── Pomodoro Page ────────────────────────────────────────────────────────────

export function PomodoroPage() {
  const timerState = usePomodoroStore(state => state.timerState)
  const currentType = usePomodoroStore(state => state.currentType)
  const timeRemaining = usePomodoroStore(state => state.timeRemaining)
  const totalDuration = usePomodoroStore(state => state.totalDuration)
  const cyclesCompleted = usePomodoroStore(state => state.cyclesCompleted)
  const settings = usePomodoroStore(state => state.settings)
  const todaySessions = usePomodoroStore(state => state.todaySessions)
  const linkedTaskId = usePomodoroStore(state => state.linkedTaskId)
  const completionPrompt = usePomodoroStore(state => state.completionPrompt)

  const start = usePomodoroStore(state => state.start)
  const startContextualFocus = usePomodoroStore(
    state => state.startContextualFocus
  )
  const pause = usePomodoroStore(state => state.pause)
  const reset = usePomodoroStore(state => state.reset)
  const skip = usePomodoroStore(state => state.skip)
  const dismissCompletionPrompt = usePomodoroStore(
    state => state.dismissCompletionPrompt
  )
  const updateSettings = usePomodoroStore(state => state.updateSettings)
  const loadSettings = usePomodoroStore(state => state.loadSettings)
  const loadTodaySessions = usePomodoroStore(state => state.loadTodaySessions)

  const loadTasks = useTasksStore(state => state.loadTasks)
  const tasks = useTasksStore(state => state.tasks)
  const toggleComplete = useTasksStore(state => state.toggleComplete)

  const { t } = useTranslation()

  useEffect(() => {
    loadSettings()
    loadTodaySessions()
    loadTasks()
  }, [loadSettings, loadTodaySessions, loadTasks])

  // Request notification permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        let granted = await isPermissionGranted()
        if (!granted) {
          const permission = await requestPermission()
          granted = permission === 'granted'
        }
      } catch (err) {
        console.error('Failed to check notification permissions:', err)
      }
    }
    void checkPermissions()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === ' ') {
        e.preventDefault()
        if (timerState === 'running') pause()
        else start()
      }
      if (e.key === 'r' || e.key === 'R') reset()
      if (e.key === 's' || e.key === 'S') void skip()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [timerState, start, pause, reset, skip])

  const isRunning = timerState === 'running'
  const progress = totalDuration > 0 ? 1 - timeRemaining / totalDuration : 0

  const handlePlayPause = () => {
    if (isRunning) pause()
    else start()
  }

  const promptTask = completionPrompt?.taskId
    ? (tasks.find(task => task.id === completionPrompt.taskId) ?? null)
    : null

  const handleCompletePromptTask = async () => {
    if (!promptTask) {
      dismissCompletionPrompt()
      return
    }

    await toggleComplete(promptTask.id)
    dismissCompletionPrompt()
  }

  const handleContinueFocus = async () => {
    await startContextualFocus(linkedTaskId)
    dismissCompletionPrompt()
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="h-full overflow-y-auto bg-background text-foreground">
        <header className="px-5 pb-2 pt-7 md:px-8 md:pt-9">
          <div className="mx-auto w-full max-w-(--axis-content-max)">
            <h1 className="text-2xl font-semibold leading-tight tracking-tight md:text-[2rem]">
              {t('pomodoro.pageTitle')}
            </h1>
          </div>
        </header>

        <div className="mx-auto w-full max-w-(--axis-content-max) px-4 pb-10 pt-5 md:px-8">
          <Dialog
            open={!!completionPrompt}
            onOpenChange={open => {
              if (!open) dismissCompletionPrompt()
            }}
          >
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{t('pomodoro.postFocus.title')}</DialogTitle>
                <DialogDescription>
                  {promptTask
                    ? t('pomodoro.postFocus.descriptionWithTask', {
                        task: promptTask.title,
                      })
                    : t('pomodoro.postFocus.description')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:justify-start">
                {promptTask ? (
                  <Button
                    type="button"
                    onClick={() => void handleCompletePromptTask()}
                  >
                    {t('pomodoro.postFocus.completeTask')}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleContinueFocus()}
                >
                  {t('pomodoro.postFocus.continue')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={dismissCompletionPrompt}
                >
                  {t('pomodoro.postFocus.keepOpen')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)] lg:items-start">
            <section className="rounded-[2rem] border border-border bg-surface p-5 shadow-neu-raised sm:p-7 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface-elevated px-3 py-1.5 text-xs font-semibold shadow-neu-raised-sm">
                    <Clock className="size-3.5 text-primary" />
                    {t('pomodoro.mode.pomodoro')}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {typeLabel(currentType, t)}
                  </span>
                </div>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {t('pomodoro.hint')}
                </span>
              </div>

              <CircularTimer
                currentType={currentType}
                timeRemaining={timeRemaining}
                totalDuration={totalDuration}
                progress={progress}
                isRunning={isRunning}
                cyclesCompleted={cyclesCompleted}
                pomosUntilLongBreak={settings.pomos_until_long_break}
                autoStartBreaks={settings.auto_start_breaks}
                autoStartFocus={settings.auto_start_focus}
              />

              <div className="mt-7 flex items-center justify-center gap-6">
                <m.button
                  type="button"
                  onClick={reset}
                  aria-label={t('pomodoro.controls.resetAria')}
                  className="group flex size-12 items-center justify-center rounded-full border border-border-strong bg-surface text-muted-foreground shadow-neu-raised-sm transition-[background-color,color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground active:translate-y-px active:shadow-neu-pressed focus-visible:shadow-focus-ring focus-visible:outline-none motion-reduce:transform-none"
                >
                  <RotateCcw
                    className="size-5 transition-transform group-hover:-rotate-45"
                    strokeWidth={2}
                  />
                </m.button>

                <m.button
                  type="button"
                  onClick={handlePlayPause}
                  aria-label={
                    isRunning
                      ? t('pomodoro.controls.pauseAria', {
                          defaultValue: 'Pause',
                        })
                      : t('pomodoro.controls.startAria', {
                          defaultValue: 'Start',
                        })
                  }
                  className="flex size-20 items-center justify-center rounded-full border border-primary/70 bg-primary text-primary-foreground shadow-neu-raised transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-primary-hover active:translate-y-px active:bg-primary-active active:shadow-neu-pressed focus-visible:shadow-focus-ring focus-visible:outline-none motion-reduce:transform-none"
                >
                  {isRunning ? (
                    <Pause className="ml-0.5 size-8" strokeWidth={2.5} />
                  ) : (
                    <Play className="ml-1.5 size-8" strokeWidth={2.5} />
                  )}
                </m.button>

                <m.button
                  type="button"
                  onClick={() => void skip()}
                  aria-label={t('pomodoro.controls.skipAria')}
                  className="group flex size-12 items-center justify-center rounded-full border border-border-strong bg-surface text-muted-foreground shadow-neu-raised-sm transition-[background-color,color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground active:translate-y-px active:shadow-neu-pressed focus-visible:shadow-focus-ring focus-visible:outline-none motion-reduce:transform-none"
                >
                  <SkipForward
                    className="size-5 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </m.button>
              </div>
            </section>

            <aside className="space-y-5">
              <TaskLinkSection />
              <SettingsSection settings={settings} onUpdate={updateSettings} />
            </aside>
          </div>

          <div className="mt-6">
            <SessionHistorySection sessions={todaySessions} />
          </div>
        </div>
      </div>
    </LazyMotion>
  )
}
