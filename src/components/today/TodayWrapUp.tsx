import { ArrowRight, Moon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/ui-store'

export function TodayWrapUp() {
  const { t } = useTranslation()
  const setWrapUpOpen = useUIStore(state => state.setWrapUpOpen)

  return (
    <section
      aria-labelledby="today-wrap-up-heading"
      className="flex flex-col gap-5 border-t border-border py-8 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border-strong bg-surface text-muted-foreground shadow-neu-raised-sm">
          <Moon className="size-4" />
        </span>
        <div className="space-y-1">
          <h2
            id="today-wrap-up-heading"
            className="text-lg font-semibold tracking-tight"
          >
            {t('today.wrapUp.title')}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {t('today.wrapUp.description')}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="rounded-xl"
        onClick={() => setWrapUpOpen(true)}
      >
        {t('today.wrapUp.action')}
        <ArrowRight className="size-4" />
      </Button>
    </section>
  )
}
