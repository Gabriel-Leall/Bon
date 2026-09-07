import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { DEFAULT_BON_CHAN_MOOD, type BonChanMood } from '@/lib/bon-chan'

export const APP_PAGES = [
  'today',
  'tasks',
  'notes',
  'calendar',
  'habits',
  'focus',
  'analysis',
] as const

export type AppPage = (typeof APP_PAGES)[number]

export type LegacyAppPage =
  | 'grid'
  | 'pomodoro'
  | 'analytics'
  | 'kanban'
  | 'github'
  | 'slack'

export type AppPageInput = AppPage | LegacyAppPage

const APP_PAGE_MIGRATIONS: Record<LegacyAppPage, AppPage> = {
  grid: 'today',
  pomodoro: 'focus',
  analytics: 'analysis',
  kanban: 'tasks',
  github: 'tasks',
  slack: 'today',
}

export function normalizeAppPage(page: unknown): AppPage {
  if (APP_PAGES.includes(page as AppPage)) return page as AppPage

  if (typeof page === 'string' && page in APP_PAGE_MIGRATIONS) {
    return APP_PAGE_MIGRATIONS[page as LegacyAppPage]
  }

  return 'today'
}

interface UIState {
  leftSidebarVisible: boolean
  rightSidebarVisible: boolean
  commandPaletteOpen: boolean
  preferencesOpen: boolean
  wrapUpOpen: boolean
  lastQuickPaneEntry: string | null
  activePage: AppPage
  activePageData: Record<string, string>
  activePreferencesPane: string
  bonChanMood: BonChanMood

  toggleLeftSidebar: () => void
  setLeftSidebarVisible: (visible: boolean) => void
  toggleRightSidebar: () => void
  setRightSidebarVisible: (visible: boolean) => void
  toggleCommandPalette: () => void
  setCommandPaletteOpen: (open: boolean) => void
  togglePreferences: () => void
  setWrapUpOpen: (open: boolean) => void
  setPreferencesOpen: (open: boolean, pane?: string) => void
  setActivePreferencesPane: (pane: string) => void
  setLastQuickPaneEntry: (text: string) => void
  setSquareCorners: (enabled: boolean) => void
  setBonChanMood: (mood: BonChanMood) => void
  navigateTo: (page: AppPageInput, data?: Record<string, string>) => void
}

export const useUIStore = create<UIState>()(
  devtools(
    set => ({
      leftSidebarVisible: true,
      rightSidebarVisible: false,
      commandPaletteOpen: false,
      preferencesOpen: false,
      wrapUpOpen: false,
      lastQuickPaneEntry: null,
      activePage: 'today',
      activePageData: {},
      activePreferencesPane: 'general',
      bonChanMood: DEFAULT_BON_CHAN_MOOD,

      toggleLeftSidebar: () =>
        set(
          state => ({ leftSidebarVisible: !state.leftSidebarVisible }),
          undefined,
          'toggleLeftSidebar'
        ),

      setLeftSidebarVisible: visible =>
        set(
          { leftSidebarVisible: visible },
          undefined,
          'setLeftSidebarVisible'
        ),

      toggleRightSidebar: () =>
        set(
          state => ({ rightSidebarVisible: !state.rightSidebarVisible }),
          undefined,
          'toggleRightSidebar'
        ),

      setRightSidebarVisible: visible =>
        set(
          { rightSidebarVisible: visible },
          undefined,
          'setRightSidebarVisible'
        ),

      toggleCommandPalette: () =>
        set(
          state => ({ commandPaletteOpen: !state.commandPaletteOpen }),
          undefined,
          'toggleCommandPalette'
        ),

      setCommandPaletteOpen: open =>
        set({ commandPaletteOpen: open }, undefined, 'setCommandPaletteOpen'),

      togglePreferences: () =>
        set(
          state => ({ preferencesOpen: !state.preferencesOpen }),
          undefined,
          'togglePreferences'
        ),

      setWrapUpOpen: open =>
        set({ wrapUpOpen: open }, undefined, 'setWrapUpOpen'),

      setPreferencesOpen: (open, pane) =>
        set(
          state => ({
            preferencesOpen: open,
            activePreferencesPane: pane || state.activePreferencesPane,
          }),
          undefined,
          'setPreferencesOpen'
        ),

      setActivePreferencesPane: pane =>
        set(
          { activePreferencesPane: pane },
          undefined,
          'setActivePreferencesPane'
        ),

      setLastQuickPaneEntry: text =>
        set({ lastQuickPaneEntry: text }, undefined, 'setLastQuickPaneEntry'),

      setSquareCorners: (enabled: boolean) => {
        document.documentElement.classList.toggle('square-corners', enabled)
      },

      setBonChanMood: mood =>
        set({ bonChanMood: mood }, undefined, 'setBonChanMood'),

      navigateTo: (page, data = {}) =>
        set(
          { activePage: normalizeAppPage(page), activePageData: data },
          undefined,
          'navigateTo'
        ),
    }),
    {
      name: 'ui-store',
    }
  )
)
