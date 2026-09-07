import { describe, it, expect, beforeEach } from 'vitest'
import { APP_PAGES, normalizeAppPage, useUIStore } from './ui-store'
import { DEFAULT_BON_CHAN_MOOD } from '@/lib/bon-chan'

describe('UIStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUIStore.setState({
      leftSidebarVisible: true,
      rightSidebarVisible: false,
      commandPaletteOpen: false,
      preferencesOpen: false,
      lastQuickPaneEntry: null,
      activePage: 'today',
      activePageData: {},
      activePreferencesPane: 'general',
      bonChanMood: DEFAULT_BON_CHAN_MOOD,
    })
  })

  it('has correct initial state', () => {
    const state = useUIStore.getState()
    expect(state.leftSidebarVisible).toBe(true)
    expect(state.rightSidebarVisible).toBe(false)
    expect(state.commandPaletteOpen).toBe(false)
    expect(state.preferencesOpen).toBe(false)
    expect(state.bonChanMood).toBe(DEFAULT_BON_CHAN_MOOD)
    expect(state.activePage).toBe('today')
  })

  it('toggles left sidebar visibility', () => {
    const { toggleLeftSidebar } = useUIStore.getState()

    toggleLeftSidebar()
    expect(useUIStore.getState().leftSidebarVisible).toBe(false)

    toggleLeftSidebar()
    expect(useUIStore.getState().leftSidebarVisible).toBe(true)
  })

  it('sets left sidebar visibility directly', () => {
    const { setLeftSidebarVisible } = useUIStore.getState()

    setLeftSidebarVisible(false)
    expect(useUIStore.getState().leftSidebarVisible).toBe(false)

    setLeftSidebarVisible(true)
    expect(useUIStore.getState().leftSidebarVisible).toBe(true)
  })

  it('toggles preferences dialog', () => {
    const { togglePreferences } = useUIStore.getState()

    togglePreferences()
    expect(useUIStore.getState().preferencesOpen).toBe(true)

    togglePreferences()
    expect(useUIStore.getState().preferencesOpen).toBe(false)
  })

  it('toggles command palette', () => {
    const { toggleCommandPalette } = useUIStore.getState()

    toggleCommandPalette()
    expect(useUIStore.getState().commandPaletteOpen).toBe(true)

    toggleCommandPalette()
    expect(useUIStore.getState().commandPaletteOpen).toBe(false)
  })

  it('navigates to habits with payload', () => {
    const { navigateTo } = useUIStore.getState()

    navigateTo('habits', { selectedHabitId: 'habit-1' })

    expect(useUIStore.getState().activePage).toBe('habits')
    expect(useUIStore.getState().activePageData['selectedHabitId']).toBe(
      'habit-1'
    )
  })

  it.each(APP_PAGES)('navigates to the canonical %s page', page => {
    useUIStore.getState().navigateTo(page)

    expect(useUIStore.getState().activePage).toBe(page)
  })

  it.each([
    ['grid', 'today'],
    ['pomodoro', 'focus'],
    ['analytics', 'analysis'],
    ['kanban', 'tasks'],
    ['github', 'tasks'],
    ['slack', 'today'],
  ] as const)('migrates the legacy %s page to %s', (legacyPage, page) => {
    useUIStore.getState().navigateTo(legacyPage)

    expect(useUIStore.getState().activePage).toBe(page)
  })

  it('falls back to Today when a restored page id is unknown', () => {
    expect(normalizeAppPage('removed-page')).toBe('today')
    expect(normalizeAppPage(null)).toBe('today')
  })

  it('sets Bon-chan mood', () => {
    const { setBonChanMood } = useUIStore.getState()

    setBonChanMood('alegre')
    expect(useUIStore.getState().bonChanMood).toBe('alegre')

    setBonChanMood('triste')
    expect(useUIStore.getState().bonChanMood).toBe('triste')
  })
})
