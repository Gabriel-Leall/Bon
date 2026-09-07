import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@/test/test-utils'
import i18n from '@/i18n/config'
import { commands } from '@/lib/tauri-bindings'
import { useUIStore } from '@/store/ui-store'
import { LeftSideBar } from './LeftSideBar'

vi.mock('@/lib/tauri-bindings', () => ({
  commands: {
    getDefaultQuickPaneShortcut: vi.fn(
      () => new Promise<string>(() => undefined)
    ),
    toggleQuickPane: vi.fn().mockResolvedValue({ status: 'ok', data: null }),
  },
}))

vi.mock('@/lib/notifications', () => ({
  notifications: {
    error: vi.fn(),
  },
}))

describe('LeftSideBar', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await i18n.changeLanguage('pt-BR')
    useUIStore.setState({
      activePage: 'today',
      activePageData: {},
      preferencesOpen: false,
      activePreferencesPane: 'general',
    })
  })

  it('renders the seven primary destinations in their product order', () => {
    render(<LeftSideBar />)

    const navigation = screen.getByRole('navigation', {
      name: 'Navegação principal',
    })
    expect(
      within(navigation)
        .getAllByRole('button')
        .map(button => button.getAttribute('aria-label'))
    ).toEqual([
      'Hoje',
      'Tarefas',
      'Notas',
      'Calendário',
      'Hábitos',
      'Foco',
      'Análise',
    ])
  })

  it('marks the active destination without relying only on color', () => {
    render(<LeftSideBar />)

    const today = screen.getByRole('button', { name: 'Hoje' })
    expect(today).toHaveAttribute('aria-current', 'page')
    expect(today).toHaveClass('font-semibold')
    expect(today).toHaveClass('before:w-px')
    expect(today).toHaveClass('shadow-neu-raised')
    expect(today).toHaveClass('active:shadow-neu-pressed')

    const notes = screen.getByRole('button', { name: 'Notas' })
    expect(notes).not.toHaveAttribute('aria-current')
    expect(notes).toHaveClass('shadow-neu-raised-sm')
  })

  it('keeps labels visible in the wide shell and collapses at the rail breakpoint', () => {
    render(<LeftSideBar />)

    expect(
      screen.getByRole('navigation', { name: 'Navegação principal' })
    ).toHaveClass('gap-2')
    expect(screen.getByTestId('axis-primary-sidebar')).toHaveClass(
      'w-(--axis-sidebar-width)',
      'max-[1099px]:w-(--axis-sidebar-width-compact)'
    )
    expect(screen.getByText('Axis')).toHaveClass('max-[1099px]:sr-only')
    expect(screen.getByText('Hoje')).toHaveClass('max-[1099px]:sr-only')
  })

  it('exposes a compact-mode tooltip from keyboard focus', async () => {
    render(<LeftSideBar />)

    screen.getByRole('button', { name: 'Foco' }).focus()

    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent('Foco')
    expect(document.querySelector('[data-slot="tooltip-content"]')).toHaveClass(
      'hidden',
      'max-[1099px]:block'
    )
  })

  it('collapses to an icon rail without hiding navigation', async () => {
    const user = userEvent.setup()
    render(<LeftSideBar />)

    const sidebar = screen.getByTestId('axis-primary-sidebar')
    const collapse = screen.getByRole('button', {
      name: 'Recolher barra lateral',
    })

    expect(sidebar).toHaveAttribute('data-state', 'expanded')
    expect(collapse).toHaveAttribute('aria-expanded', 'true')

    await user.click(collapse)

    expect(sidebar).toHaveAttribute('data-state', 'collapsed')
    expect(sidebar).toHaveClass('w-(--axis-sidebar-width-compact)')
    expect(screen.getByTestId('axis-sidebar-brand')).toHaveClass('hidden')
    expect(screen.getByText('Hoje')).toHaveClass('sr-only')
    expect(screen.getByRole('button', { name: 'Hoje' })).toHaveClass('size-9')

    const expand = screen.getByRole('button', {
      name: 'Expandir barra lateral',
    })
    expect(expand).toHaveAttribute('aria-expanded', 'false')

    await user.click(expand)

    expect(sidebar).toHaveAttribute('data-state', 'expanded')
    expect(screen.getByText('Hoje')).toHaveClass('max-[1099px]:sr-only')
  })

  it('navigates with a named button and updates aria-current', async () => {
    const user = userEvent.setup()
    render(<LeftSideBar />)

    await user.click(screen.getByRole('button', { name: 'Foco' }))

    expect(useUIStore.getState().activePage).toBe('focus')
    expect(screen.getByRole('button', { name: 'Foco' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('activates a destination from the keyboard', async () => {
    const user = userEvent.setup()
    render(<LeftSideBar />)
    const analysis = screen.getByRole('button', { name: 'Análise' })
    analysis.focus()

    await user.keyboard('{Enter}')

    expect(useUIStore.getState().activePage).toBe('analysis')
    expect(analysis).toHaveAttribute('aria-current', 'page')
  })

  it('keeps quick capture and settings in the utility area', async () => {
    const user = userEvent.setup()
    render(<LeftSideBar />)

    const utilities = screen.getByRole('navigation', { name: 'Utilidades' })
    expect(utilities).toHaveClass('gap-2')
    const quickCapture = within(utilities).getByRole('button', {
      name: 'Captura rápida',
    })
    const settings = within(utilities).getByRole('button', {
      name: 'Configurações',
    })

    expect(quickCapture).toHaveClass('shadow-neu-raised-sm')
    expect(settings).toHaveClass('shadow-neu-raised-sm')

    await user.click(quickCapture)
    expect(commands.toggleQuickPane).toHaveBeenCalledOnce()

    await user.click(settings)
    expect(useUIStore.getState()).toMatchObject({
      preferencesOpen: true,
      activePreferencesPane: 'general',
    })
  })
})
