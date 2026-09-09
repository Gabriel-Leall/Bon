import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { exportProductUsageSnapshot } from '@/lib/product-usage'
import { useGoogleStore } from '@/store/google-store'
import { useOnboardingStore } from '@/store/onboarding-store'
import { useUIStore } from '@/store/ui-store'
import { SettingsField, SettingsSection } from '../shared/SettingsComponents'

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.8h3.6c2.1-2 3.3-4.8 3.3-8.1Z"
      fill="#4285F4"
    />
    <path
      d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.2V17A11 11 0 0 0 12 23Z"
      fill="#34A853"
    />
    <path
      d="M5.8 14.1a6.5 6.5 0 0 1 0-4.2V7.1H2.2A11 11 0 0 0 1 12c0 1.8.4 3.5 1.2 4.9l3.6-2.8Z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.4c1.6 0 3.1.5 4.2 1.6l3.2-3.1A10.6 10.6 0 0 0 12 1a11 11 0 0 0-9.8 6.1l3.6 2.8A6.5 6.5 0 0 1 12 5.4Z"
      fill="#EA4335"
    />
  </svg>
)

function GoogleConnection() {
  const { t } = useTranslation()
  const user = useGoogleStore(state => state.user)
  const isAuthenticated = useGoogleStore(state => state.isAuthenticated)
  const isLoading = useGoogleStore(state => state.isLoading)
  const error = useGoogleStore(state => state.error)
  const logout = useGoogleStore(state => state.logout)
  const startOAuthFlow = useGoogleStore(state => state.startOAuthFlow)

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card/30 p-4 transition-colors duration-200 hover:bg-card/50">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background shadow-sm">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name ?? user.email}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <GoogleIcon className="h-5 w-5" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">Google</span>
          <span className="text-xs text-muted-foreground">
            {isAuthenticated
              ? t('preferences.user.connectedAs', { name: user?.email })
              : t('preferences.user.notConnected')}
          </span>
          {!isAuthenticated && error ? (
            <span className="max-w-[360px] truncate text-xs text-destructive">
              {error}
            </span>
          ) : null}
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => void (isAuthenticated ? logout() : startOAuthFlow())}
        disabled={!isAuthenticated && isLoading}
        className="h-8 px-3 text-xs"
      >
        {isAuthenticated
          ? t('preferences.user.logout')
          : isLoading
            ? t('preferences.user.connecting')
            : t('preferences.user.connect')}
      </Button>
    </div>
  )
}

function ConnectionsSection() {
  const { t } = useTranslation()

  return (
    <SettingsSection title={t('preferences.user.connections')}>
      <div className="grid gap-3">
        <GoogleConnection />
      </div>
    </SettingsSection>
  )
}

function AdvancedSection() {
  const { t } = useTranslation()
  const resetOnboarding = useOnboardingStore(state => state.resetOnboarding)
  const setPreferencesOpen = useUIStore(state => state.setPreferencesOpen)
  const [isExportingUsage, setIsExportingUsage] = useState(false)

  const handleResetOnboarding = () => {
    resetOnboarding()
    setPreferencesOpen(false)
    toast.success(t('toast.success.preferencesSaved'))
  }

  const handleExportProductUsage = async () => {
    setIsExportingUsage(true)
    try {
      const exported = await exportProductUsageSnapshot()
      if (exported) {
        toast.success(t('preferences.advanced.productUsageExportSuccess'))
      }
    } catch {
      toast.error(t('preferences.advanced.productUsageExportError'))
    }
    setIsExportingUsage(false)
  }

  return (
    <SettingsSection title={t('preferences.advanced.title')}>
      <div className="space-y-4">
        <SettingsField
          label={t('preferences.advanced.resetOnboarding')}
          description={t('preferences.advanced.resetOnboardingDescription')}
        >
          <Button
            variant="destructive"
            size="sm"
            onClick={handleResetOnboarding}
            className="h-8"
          >
            {t('preferences.advanced.resetOnboarding')}
          </Button>
        </SettingsField>

        <SettingsField
          label={t('preferences.advanced.productUsageExport')}
          description={t('preferences.advanced.productUsageExportDescription')}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleExportProductUsage()}
            disabled={isExportingUsage}
            className="h-8 gap-2"
          >
            <Download className="size-3.5" />
            {isExportingUsage
              ? t('preferences.advanced.productUsageExporting')
              : t('preferences.advanced.productUsageExport')}
          </Button>
        </SettingsField>
      </div>
    </SettingsSection>
  )
}

export function UserPane() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <ConnectionsSection />
      <AdvancedSection />
    </div>
  )
}
