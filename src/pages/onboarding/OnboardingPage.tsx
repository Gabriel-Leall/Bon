import { useRef, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
  Monitor,
  PanelTopOpen,
  Play,
  Plus,
  Target,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TitleBar } from '@/components/titlebar/TitleBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getLocalISODate } from '@/lib/calendar-domain'
import { commands, unwrapResult } from '@/lib/tauri-bindings'
import { recordProductUsage } from '@/lib/product-usage'
import { cn } from '@/lib/utils'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { useOnboardingStore } from '@/store/onboarding-store'
import { usePomodoroStore } from '@/store/pomodoro-store'
import { useTasksStore } from '@/store/tasks-store'
import { useUIStore } from '@/store/ui-store'

type OnboardingStep = 1 | 2 | 3 | 4
type CaptureKind = 'task' | 'note' | 'event'

const ONBOARDING_STEPS = [
  { step: 1, label: 'now', Icon: Target },
  { step: 2, label: 'nextFocus', Icon: CheckCircle2 },
  { step: 3, label: 'session', Icon: Clock3 },
  { step: 4, label: 'quickCapture', Icon: PanelTopOpen },
] as const

function FocusSetupStep({
  error,
  examples,
  isSaving,
  taskTitle,
  onSubmit,
  onTaskTitleChange,
}: {
  error: string | null
  examples: string[]
  isSaving: boolean
  taskTitle: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onTaskTitleChange: (title: string) => void
}) {
  const { t } = useTranslation()

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <OnboardingIntro step={1} title={t('onboarding.screen1.title')} />
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="initial-focus-task"
        >
          {t('onboarding.taskLabel')}
        </label>
        <Input
          autoFocus
          id="initial-focus-task"
          onChange={event => onTaskTitleChange(event.target.value)}
          placeholder={t('onboarding.taskPlaceholder')}
          value={taskTitle}
          className="h-14 border border-border-strong bg-surface-sunken px-4 text-base shadow-neu-pressed transition-[border-color,box-shadow] duration-200 focus-visible:border-ring dark:bg-surface-sunken"
        />
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">
          {t('onboarding.examplesLabel')}
        </p>
        <div className="flex flex-wrap gap-2">
          {examples.map(example => (
            <button
              className="rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-muted-foreground shadow-neu-raised-sm transition-[background-color,color,transform] duration-200 hover:bg-accent hover:text-accent-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              key={example}
              onClick={() => onTaskTitleChange(example)}
              type="button"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
      <OnboardingError error={error} />
      <div className="flex items-center justify-between gap-4 pt-2">
        <p className="text-sm text-muted-foreground">
          {t('onboarding.duration')}
        </p>
        <Button
          disabled={!taskTitle.trim() || isSaving}
          size="lg"
          type="submit"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <ArrowRight />}
          {t('onboarding.submit')}
        </Button>
      </div>
    </form>
  )
}

function FocusConfirmationStep({
  taskTitle,
  onBack,
  onContinue,
}: {
  taskTitle: string
  onBack: () => void
  onContinue: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-8">
      <OnboardingIntro step={2} title={t('onboarding.screen2.title')} />
      <FocusPreview taskTitle={taskTitle} />
      <div className="flex items-center justify-between gap-4">
        <Button onClick={onBack} type="button" variant="ghost">
          {t('onboarding.back')}
        </Button>
        <Button onClick={onContinue} size="lg" type="button">
          <ArrowRight />
          {t('onboarding.screen2.submit')}
        </Button>
      </div>
    </div>
  )
}

function FocusSessionStep({
  error,
  isSaving,
  taskTitle,
  onStart,
}: {
  error: string | null
  isSaving: boolean
  taskTitle: string
  onStart: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-neu-raised-sm">
        <Target className="size-4" />
        <span>{taskTitle}</span>
      </div>
      <div className="mt-8 flex size-64 items-center justify-center rounded-full border-[6px] border-primary bg-surface shadow-neu-raised motion-safe:animate-[onboarding-marker-in_360ms_cubic-bezier(0.22,1,0.36,1)] sm:size-80">
        <div>
          <p className="text-5xl font-semibold tabular-nums tracking-tight text-foreground sm:text-6xl">
            25:00
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('onboarding.screen3.timerCaption')}
          </p>
        </div>
      </div>
      <div className="mt-8 max-w-xl">
        <h1
          className="text-4xl font-semibold tracking-tight text-foreground lg:text-5xl"
          id="onboarding-heading"
        >
          {t('onboarding.screen3.title')}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {t('onboarding.screen3.description')}
        </p>
      </div>
      <OnboardingError error={error} />
      <Button
        className="mt-7"
        disabled={isSaving}
        onClick={onStart}
        size="lg"
        type="button"
      >
        {isSaving ? <Loader2 className="animate-spin" /> : <Play />}
        {t('onboarding.screen3.submit')}
      </Button>
      <p className="mt-5 text-sm text-muted-foreground">
        {t('onboarding.screen3.hint')}
      </p>
    </div>
  )
}

function QuickCaptureStep({
  captureKind,
  captureSaved,
  captureText,
  isCapturing,
  onCaptureKindChange,
  onCaptureTextChange,
  onFinish,
  onSubmit,
}: {
  captureKind: CaptureKind
  captureSaved: boolean
  captureText: string
  isCapturing: boolean
  onCaptureKindChange: (kind: CaptureKind) => void
  onCaptureTextChange: (text: string) => void
  onFinish: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center text-center">
      <p className="rounded-full border border-border-strong bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground shadow-neu-raised-sm">
        {t('onboarding.screen4.eyebrow')}
      </p>
      <h1
        className="mt-8 max-w-3xl text-4xl font-semibold tracking-tight text-foreground lg:text-5xl"
        id="onboarding-heading"
      >
        {t('onboarding.screen4.title')}
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        {t('onboarding.screen4.description')}
      </p>
      <form
        aria-label={t('onboarding.quickPane.title')}
        className="mt-8 w-full max-w-xl overflow-hidden rounded-2xl border border-border-strong bg-surface text-left shadow-neu-raised"
        onSubmit={onSubmit}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="size-2 rounded-full bg-muted-foreground" />
            {t('onboarding.quickPane.title')}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <kbd className="rounded border border-border px-2 py-1 font-mono">
              Alt
            </kbd>
            <span>+</span>
            <kbd className="rounded border border-border px-2 py-1 font-mono">
              Space
            </kbd>
          </div>
        </div>
        <div className="p-5">
          <label className="sr-only" htmlFor="onboarding-quick-capture">
            {t('onboarding.quickPane.inputLabel')}
          </label>
          <div className="flex items-center gap-3 rounded-xl border border-border-strong bg-surface-sunken px-4 shadow-neu-pressed transition-[border-color] duration-200 focus-within:border-ring">
            <Plus className="size-5 shrink-0 text-muted-foreground" />
            <Input
              className="h-14 border-0 bg-transparent px-0 shadow-none dark:bg-transparent focus-visible:shadow-none focus-visible:ring-0"
              id="onboarding-quick-capture"
              onChange={event => onCaptureTextChange(event.target.value)}
              placeholder={t('onboarding.quickPane.placeholder')}
              value={captureText}
            />
          </div>
          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1" role="tablist">
              {(['task', 'note', 'event'] as const).map(kind => (
                <button
                  aria-selected={captureKind === kind}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm transition-colors',
                    captureKind === kind
                      ? 'bg-accent font-medium text-accent-foreground shadow-neu-raised-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  key={kind}
                  onClick={() => onCaptureKindChange(kind)}
                  role="tab"
                  type="button"
                >
                  {t(`onboarding.quickPane.kind.${kind}`)}
                </button>
              ))}
            </div>
            <Button disabled={!captureText.trim() || isCapturing} type="submit">
              {isCapturing ? <Loader2 className="animate-spin" /> : null}
              {t('onboarding.quickPane.save')}
            </Button>
          </div>
        </div>
      </form>
      <p className="mt-7 flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="size-4" />
        {captureSaved
          ? t('onboarding.quickPane.saved')
          : t('onboarding.quickPane.assurance')}
      </p>
      <Button className="mt-8" onClick={onFinish} size="lg" type="button">
        {t('onboarding.screen4.submit')}
      </Button>
    </div>
  )
}

function OnboardingStepContent({
  step,
  taskTitle,
  examples,
  isSaving,
  error,
  captureKind,
  captureSaved,
  captureText,
  isCapturing,
  onTaskTitleChange,
  onCreateFocus,
  onStepChange,
  onStartSession,
  onCaptureKindChange,
  onCaptureTextChange,
  onCaptureSubmit,
  onFinish,
}: {
  step: OnboardingStep
  taskTitle: string
  examples: string[]
  isSaving: boolean
  error: string | null
  captureKind: CaptureKind
  captureSaved: boolean
  captureText: string
  isCapturing: boolean
  onTaskTitleChange: (title: string) => void
  onCreateFocus: (event: FormEvent<HTMLFormElement>) => void
  onStepChange: (step: OnboardingStep) => void
  onStartSession: () => void
  onCaptureKindChange: (kind: CaptureKind) => void
  onCaptureTextChange: (text: string) => void
  onCaptureSubmit: (event: FormEvent<HTMLFormElement>) => void
  onFinish: () => void
}) {
  switch (step) {
    case 1:
      return (
        <FocusSetupStep
          error={error}
          examples={examples}
          isSaving={isSaving}
          taskTitle={taskTitle}
          onSubmit={onCreateFocus}
          onTaskTitleChange={onTaskTitleChange}
        />
      )
    case 2:
      return (
        <FocusConfirmationStep
          taskTitle={taskTitle}
          onBack={() => onStepChange(1)}
          onContinue={() => onStepChange(3)}
        />
      )
    case 3:
      return (
        <FocusSessionStep
          error={error}
          isSaving={isSaving}
          taskTitle={taskTitle}
          onStart={onStartSession}
        />
      )
    case 4:
      return (
        <QuickCaptureStep
          captureKind={captureKind}
          captureSaved={captureSaved}
          captureText={captureText}
          isCapturing={isCapturing}
          onCaptureKindChange={onCaptureKindChange}
          onCaptureTextChange={onCaptureTextChange}
          onFinish={onFinish}
          onSubmit={onCaptureSubmit}
        />
      )
  }
}

export function OnboardingPage() {
  const [taskTitle, setTaskTitle] = useState('')
  const focusTaskIdRef = useRef<string | null>(null)
  const [step, setStep] = useState<OnboardingStep>(1)
  const [isSaving, setIsSaving] = useState(false)
  const [captureText, setCaptureText] = useState('')
  const [captureKind, setCaptureKind] = useState<CaptureKind>('task')
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureSaved, setCaptureSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()

  const examples = [
    t('onboarding.examples.clients'),
    t('onboarding.examples.week'),
    t('onboarding.examples.delivery'),
  ]

  const addTask = useTasksStore(state => state.addTask)
  const initializeTodayPlan = useDailyPlanStore(
    state => state.initializeTodayPlan
  )
  const updateFocus = useDailyPlanStore(state => state.updateFocus)
  const startContextualFocus = usePomodoroStore(
    state => state.startContextualFocus
  )
  const completeOnboarding = useOnboardingStore(
    state => state.completeOnboarding
  )
  const navigateTo = useUIStore(state => state.navigateTo)

  const handleCreateFocus = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const title = taskTitle.trim()
    if (!title || isSaving) return

    setIsSaving(true)
    setError(null)

    try {
      const task = await addTask(title, { priority: 'high' })
      await initializeTodayPlan()

      if (!useDailyPlanStore.getState().activePlan) {
        setError(t('onboarding.error.save'))
      } else {
        await updateFocus(task.id, 'manual')
        focusTaskIdRef.current = task.id
        setStep(2)
      }
    } catch (saveError) {
      console.error('Failed to create initial focus', saveError)
      setError(t('onboarding.error.save'))
    }

    setIsSaving(false)
  }

  const handleStartSession = async () => {
    const focusTaskId = focusTaskIdRef.current
    if (!focusTaskId || isSaving) return

    setIsSaving(true)
    setError(null)
    let started = false
    try {
      started = await startContextualFocus(focusTaskId)
    } catch (startError) {
      console.error('Failed to start initial focus session', startError)
    }

    if (started) {
      setStep(4)
    } else {
      setError(t('onboarding.error.session'))
    }

    setIsSaving(false)
  }

  const handleFinish = () => {
    completeOnboarding()
    void recordProductUsage('onboarding_completed')
    navigateTo('focus')
  }

  const handleQuickCapture = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = captureText.trim()
    if (!content || isCapturing) return

    setIsCapturing(true)
    setError(null)

    try {
      if (captureKind === 'task') {
        await addTask(content, { priority: 'medium' })
      } else if (captureKind === 'note') {
        await unwrapResult(
          await commands.createNote({ title: null, content, folder: null })
        )
      } else {
        const today = getLocalISODate()
        const tomorrow = getLocalISODate(new Date(Date.now() + 86_400_000))
        const now = new Date().toISOString()
        await unwrapResult(
          await commands.createEvent({
            id: crypto.randomUUID(),
            title: content,
            description: null,
            start_date: today,
            end_date: tomorrow,
            all_day: true,
            color: null,
            created_at: now,
            updated_at: now,
          })
        )
      }

      setCaptureText('')
      setCaptureSaved(true)
      void recordProductUsage('capture_saved')
    } catch (captureError) {
      console.error('Failed to save onboarding quick capture', captureError)
      setError(t('onboarding.error.capture'))
    }

    setIsCapturing(false)
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <TitleBar
        className="absolute top-0 z-50 w-full border-b-0 bg-transparent"
        showClock={false}
      />

      <div className="flex flex-1 overflow-hidden pt-8">
        <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-border bg-sidebar px-7 py-8 lg:flex">
          <div className="flex flex-col gap-12">
            <div className="flex items-center gap-3">
              <img
                src="/bon/bon-approved.png"
                alt=""
                className="size-10 shrink-0 object-contain"
              />
              <div>
                <p className="font-semibold text-foreground">Bon</p>
                <p className="text-xs text-muted-foreground">
                  {t('onboarding.brandTagline')}
                </p>
              </div>
            </div>

            <ol
              className="flex flex-col gap-5"
              aria-label={t('onboarding.progressLabel')}
            >
              {ONBOARDING_STEPS.map(({ step: itemStep, label, Icon }) => {
                const isCurrent = itemStep === step
                const isComplete = itemStep < step

                return (
                  <li
                    className={cn(
                      'flex items-center gap-3 text-sm transition-colors duration-200',
                      isCurrent && 'font-semibold text-foreground',
                      !isCurrent && 'text-muted-foreground'
                    )}
                    key={itemStep}
                  >
                    <span
                      className={cn(
                        'flex size-7 items-center justify-center rounded-full border transition-[background-color,color,transform] duration-200 motion-safe:animate-[onboarding-marker-in_240ms_cubic-bezier(0.22,1,0.36,1)]',
                        isCurrent &&
                          'border-primary bg-primary text-primary-foreground',
                        isComplete &&
                          'border-border-strong bg-accent text-accent-foreground',
                        !isCurrent &&
                          !isComplete &&
                          'border-border bg-surface-sunken text-muted-foreground'
                      )}
                    >
                      {isComplete ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Icon className="size-3.5" />
                      )}
                    </span>
                    {t(`onboarding.step.${label}`)}
                  </li>
                )
              })}
            </ol>
          </div>

          <OnboardingStepCard step={step} />
        </aside>

        <main className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-12 lg:px-16">
          <section
            aria-labelledby="onboarding-heading"
            className="w-full max-w-2xl motion-safe:animate-[onboarding-step-in_280ms_cubic-bezier(0.22,1,0.36,1)]"
            key={step}
          >
            <OnboardingStepContent
              captureKind={captureKind}
              captureSaved={captureSaved}
              captureText={captureText}
              error={error}
              examples={examples}
              isCapturing={isCapturing}
              isSaving={isSaving}
              step={step}
              taskTitle={taskTitle}
              onCaptureKindChange={setCaptureKind}
              onCaptureSubmit={event => void handleQuickCapture(event)}
              onCaptureTextChange={text => {
                setCaptureText(text)
                setCaptureSaved(false)
              }}
              onCreateFocus={event => void handleCreateFocus(event)}
              onFinish={handleFinish}
              onStartSession={() => void handleStartSession()}
              onStepChange={setStep}
              onTaskTitleChange={setTaskTitle}
            />
          </section>
        </main>

        <aside className="hidden w-72 shrink-0 border-l border-border bg-sidebar p-8 xl:block">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('onboarding.today')}
          </p>
          <FocusPreview
            taskTitle={taskTitle || t('onboarding.previewEmpty')}
            compact
          />
          <div className="mt-5 flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-foreground" />
            <p>
              {t(
                step > 1
                  ? 'onboarding.previewFocused'
                  : 'onboarding.previewDescription'
              )}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function OnboardingIntro({
  step,
  title,
}: {
  step: OnboardingStep
  title: string
}) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t(`onboarding.screen${step}.eyebrow`)}
      </p>
      <h1
        className="text-4xl font-semibold tracking-tight text-foreground lg:text-5xl"
        id="onboarding-heading"
      >
        {title}
      </h1>
      <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
        {t(`onboarding.screen${step}.description`)}
      </p>
    </div>
  )
}

function OnboardingStepCard({ step }: { step: OnboardingStep }) {
  const { t } = useTranslation()

  if (step === 1) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border-strong bg-surface p-5 text-xs leading-relaxed text-muted-foreground shadow-neu-raised-sm">
        <Monitor className="size-4 text-foreground" />
        <p>{t('onboarding.stepCard.desktop')}</p>
      </div>
    )
  }

  if (step === 2) {
    return (
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t('onboarding.stepCard.focus')}
      </p>
    )
  }

  if (step === 3) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Bell className="size-4 shrink-0" />
        <p>{t('onboarding.stepCard.session')}</p>
      </div>
    )
  }

  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      {t('onboarding.stepCard.capture')}
    </p>
  )
}

function FocusPreview({
  compact = false,
  taskTitle,
}: {
  compact?: boolean
  taskTitle: string
}) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-border-strong bg-surface p-5 shadow-neu-raised-sm',
        compact && 'mt-8'
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          {t('onboarding.nextTask')}
        </p>
        <Circle className="size-4 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium leading-relaxed text-foreground">
        {taskTitle}
      </p>
    </div>
  )
}

function OnboardingError({ error }: { error: string | null }) {
  if (!error) return null

  return (
    <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {error}
    </p>
  )
}
