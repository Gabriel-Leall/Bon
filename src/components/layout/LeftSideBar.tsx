import { useEffect, useState } from 'react'
import {
  BarChart3,
  CalendarDays,
  House,
  ListTodo,
  PanelLeftClose,
  PanelLeftOpen,
  Repeat2,
  Settings2,
  SquarePen,
  StickyNote,
  TimerReset,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { commands } from '@/lib/tauri-bindings'
import { notifications } from '@/lib/notifications'
import { cn } from '@/lib/utils'
import { useUIStore, type AppPage } from '@/store/ui-store'

interface NavItem {
  id: AppPage
  labelKey: string
  icon: React.ElementType
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: 'today', labelKey: 'navigation.today', icon: House },
  { id: 'tasks', labelKey: 'navigation.tasks', icon: ListTodo },
  { id: 'notes', labelKey: 'navigation.notes', icon: StickyNote },
  { id: 'calendar', labelKey: 'navigation.calendar', icon: CalendarDays },
  { id: 'habits', labelKey: 'navigation.habits', icon: Repeat2 },
  { id: 'focus', labelKey: 'navigation.focus', icon: TimerReset },
  { id: 'analysis', labelKey: 'navigation.analysis', icon: BarChart3 },
]

interface LeftSideBarProps {
  children?: React.ReactNode
  className?: string
}

const compactTooltipClassName = 'hidden max-[1099px]:block'

export function LeftSideBar({ children, className }: LeftSideBarProps) {
  const { t } = useTranslation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [quickPaneShortcut, setQuickPaneShortcut] = useState<string | null>(
    null
  )
  const activePage = useUIStore(state => state.activePage)
  const navigateTo = useUIStore(state => state.navigateTo)
  const setPreferencesOpen = useUIStore(state => state.setPreferencesOpen)
  const quickPaneLabel = quickPaneShortcut
    ? t('quickPane.openWithShortcut', { shortcut: quickPaneShortcut })
    : t('quickPane.open')
  const collapseLabel = t(
    sidebarCollapsed ? 'sidebar.expand' : 'sidebar.collapse'
  )
  const tooltipClassName = sidebarCollapsed
    ? undefined
    : compactTooltipClassName

  useEffect(() => {
    let cancelled = false

    commands
      .getDefaultQuickPaneShortcut()
      .then(shortcut => {
        if (!cancelled) setQuickPaneShortcut(shortcut)
      })
      .catch(() => {
        if (!cancelled) setQuickPaneShortcut(null)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleQuickPaneToggle = async () => {
    const result = await commands.toggleQuickPane()

    if (result.status === 'error') {
      void notifications.error(t('quickPane.error.openFailed'), result.error)
    }
  }

  return (
    <aside
      data-testid="axis-primary-sidebar"
      data-state={sidebarCollapsed ? 'collapsed' : 'expanded'}
      className={cn(
        'flex h-full w-(--axis-sidebar-width) shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out max-[1099px]:w-(--axis-sidebar-width-compact) motion-reduce:transition-none',
        sidebarCollapsed && 'w-(--axis-sidebar-width-compact)',
        className
      )}
    >
      <div
        className={cn(
          'flex h-14 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border px-3 max-[1099px]:justify-center max-[1099px]:px-0',
          sidebarCollapsed && 'justify-center'
        )}
      >
        <div
          data-testid="axis-sidebar-brand"
          className={cn(
            'flex min-w-0 flex-1 items-center gap-3 max-[1099px]:justify-center',
            sidebarCollapsed && 'hidden max-[1099px]:flex'
          )}
        >
          <img
            src="/bon/bon-approved.png"
            alt=""
            aria-hidden="true"
            className="size-7 shrink-0 object-contain"
          />
          <span className="truncate text-base font-semibold tracking-tight max-[1099px]:sr-only">
            Bon
          </span>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setSidebarCollapsed(value => !value)}
              aria-label={collapseLabel}
              aria-controls="axis-primary-navigation"
              aria-expanded={!sidebarCollapsed}
              title={collapseLabel}
              className="rounded-lg border-sidebar-border bg-sidebar text-muted-foreground shadow-neu-raised-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:shadow-neu-pressed max-[1099px]:hidden"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen aria-hidden="true" />
              ) : (
                <PanelLeftClose aria-hidden="true" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {collapseLabel}
          </TooltipContent>
        </Tooltip>
      </div>

      <nav
        id="axis-primary-navigation"
        className="flex flex-1 flex-col gap-2 p-2 pt-3"
        aria-label={t('sidebar.mainNavigation')}
      >
        {NAV_ITEMS.map(item => {
          const label = t(item.labelKey)
          const isActive = activePage === item.id

          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateTo(item.id)}
                  aria-label={label}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group/nav relative w-full justify-start gap-3 overflow-hidden rounded-lg px-3 max-[1099px]:size-9 max-[1099px]:justify-center max-[1099px]:px-0',
                    sidebarCollapsed && 'mx-auto size-9 justify-center px-0',
                    isActive
                      ? 'border-sidebar-border bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-neu-raised active:shadow-neu-pressed before:absolute before:inset-y-2 before:left-0 before:w-px before:bg-sidebar-primary'
                      : 'border-sidebar-border bg-sidebar text-muted-foreground shadow-neu-raised-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:shadow-neu-pressed'
                  )}
                >
                  <item.icon
                    aria-hidden="true"
                    strokeWidth={isActive ? 2 : 1.75}
                  />
                  <span
                    className={cn(
                      'min-w-0 truncate',
                      sidebarCollapsed ? 'sr-only' : 'max-[1099px]:sr-only'
                    )}
                  >
                    {label}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={8}
                className={tooltipClassName}
              >
                {label}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </nav>

      {children}

      <nav
        className="flex shrink-0 flex-col gap-2 border-t border-sidebar-border p-2"
        aria-label={t('sidebar.utilityNavigation')}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void handleQuickPaneToggle()}
              aria-label={t('navigation.quickCapture')}
              className={cn(
                'w-full justify-start gap-3 rounded-lg border-sidebar-border bg-sidebar px-3 text-muted-foreground shadow-neu-raised-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:shadow-neu-pressed max-[1099px]:size-9 max-[1099px]:justify-center max-[1099px]:px-0',
                sidebarCollapsed && 'mx-auto size-9 justify-center px-0'
              )}
            >
              <SquarePen aria-hidden="true" />
              <span
                className={cn(
                  'min-w-0 truncate',
                  sidebarCollapsed ? 'sr-only' : 'max-[1099px]:sr-only'
                )}
              >
                {t('navigation.quickCapture')}
              </span>
              {quickPaneShortcut ? (
                <kbd
                  aria-hidden="true"
                  className={cn(
                    'ml-auto max-w-20 truncate rounded-sm border border-sidebar-border bg-surface-sunken px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground max-[1099px]:hidden',
                    sidebarCollapsed && 'hidden'
                  )}
                >
                  {quickPaneShortcut}
                </kbd>
              ) : null}
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={8}
            className={tooltipClassName}
          >
            {quickPaneLabel}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPreferencesOpen(true, 'general')}
              aria-label={t('navigation.settings')}
              className={cn(
                'w-full justify-start gap-3 rounded-lg border-sidebar-border bg-sidebar px-3 text-muted-foreground shadow-neu-raised-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:shadow-neu-pressed max-[1099px]:size-9 max-[1099px]:justify-center max-[1099px]:px-0',
                sidebarCollapsed && 'mx-auto size-9 justify-center px-0'
              )}
            >
              <Settings2 aria-hidden="true" />
              <span
                className={cn(
                  'min-w-0 truncate',
                  sidebarCollapsed ? 'sr-only' : 'max-[1099px]:sr-only'
                )}
              >
                {t('navigation.settings')}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={8}
            className={tooltipClassName}
          >
            {t('navigation.settings')}
          </TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  )
}
