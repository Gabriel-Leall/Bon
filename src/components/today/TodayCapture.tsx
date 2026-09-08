import {
  ArrowUpRight,
  CalendarPlus2,
  CheckSquare2,
  StickyNote,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { commands } from '@/lib/tauri-bindings'
import { notifications } from '@/lib/notifications'

export function TodayCapture() {
  const { t } = useTranslation()

  const openCapture = async () => {
    const result = await commands.toggleQuickPane()
    if (result.status === 'error') {
      void notifications.error(t('quickPane.error.openFailed'))
    }
  }

  return (
    <section
      aria-labelledby="today-capture-heading"
      className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-neu-raised"
    >
      <div className="space-y-1">
        <h2
          id="today-capture-heading"
          className="text-lg font-semibold tracking-tight"
        >
          {t('today.capture.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('today.capture.description')}
        </p>
      </div>

      <button
        type="button"
        onClick={() => void openCapture()}
        className="mt-5 flex min-h-28 flex-1 cursor-pointer flex-col justify-between rounded-xl border border-border-strong bg-surface-sunken p-4 text-left text-muted-foreground shadow-neu-pressed transition-[background-color,border-color,color,box-shadow] hover:border-primary/60 hover:bg-accent hover:text-accent-foreground focus-visible:shadow-focus-input focus-visible:outline-none"
      >
        <span className="text-base">{t('today.capture.placeholder')}</span>
        <span className="flex w-full flex-wrap items-center justify-between gap-3 text-xs">
          <span className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <CheckSquare2 className="size-3.5" />
              {t('capturePane.mode.task')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <StickyNote className="size-3.5" />
              {t('capturePane.mode.note')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarPlus2 className="size-3.5" />
              {t('capturePane.mode.event')}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
            {t('today.capture.open')}
            <ArrowUpRight className="size-3.5" />
          </span>
        </span>
      </button>
    </section>
  )
}
