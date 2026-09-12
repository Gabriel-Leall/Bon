import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n/config'
import { usePreferences } from '@/services/preferences'
import { BonCompanion } from './BonCompanion'

vi.mock('@/services/preferences', () => ({
  usePreferences: vi.fn(),
}))

const visiblePreferences = {
  buddy_enabled: true,
  buddy_proactive_messages_enabled: true,
  buddy_reduced_motion: false,
  buddy_sound_enabled: false,
}

describe('BonCompanion', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await i18n.changeLanguage('pt-BR')
    vi.mocked(usePreferences).mockReturnValue({
      data: visiblePreferences,
    } as never)
  })

  afterEach(() => vi.useRealTimers())

  it('renders the physical book and an urgent persistent message', () => {
    render(
      <BonCompanion
        variant="focus"
        state="surprised"
        book="closed"
        urgent
        message="Compromisso em cinco minutos."
      />
    )

    const avatar = screen.getByRole('button', {
      name: 'Interagir com o Bon',
    })
    expect(avatar).toHaveAttribute('data-book', 'closed')
    expect(avatar).toHaveAttribute('data-state', 'surprised')
    expect(avatar).toBeDisabled()
    expect(avatar.querySelector('.bon-avatar-renderer')).toBeInTheDocument()
    expect(avatar.querySelector('.bon-mouth-opening')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Compromisso em cinco minutos.'
    )
  })

  it('keeps the reading companion quiet during focus', () => {
    render(<BonCompanion variant="focus" state="focus" book="open" />)
    const avatar = screen.getByRole('button', { name: 'Interagir com o Bon' })

    for (let click = 0; click < 4; click += 1) fireEvent.click(avatar)

    expect(avatar).toBeDisabled()
    expect(avatar).toHaveAttribute('data-state', 'focus')
    expect(screen.queryByText('Eu entendi.')).not.toBeInTheDocument()
  })

  it('respects visibility and proactive-message preferences independently', () => {
    vi.mocked(usePreferences).mockReturnValue({
      data: {
        ...visiblePreferences,
        buddy_proactive_messages_enabled: false,
      },
    } as never)
    const { rerender } = render(
      <BonCompanion variant="compact" state="idle" message="Sugestão" />
    )

    expect(
      screen.getByRole('button', { name: 'Interagir com o Bon' })
    ).toBeInTheDocument()
    expect(screen.queryByText('Sugestão')).not.toBeInTheDocument()

    vi.mocked(usePreferences).mockReturnValue({
      data: { ...visiblePreferences, buddy_enabled: false },
    } as never)
    rerender(<BonCompanion variant="compact" state="idle" message="Sugestão" />)
    expect(
      screen.queryByRole('button', { name: 'Interagir com o Bon' })
    ).not.toBeInTheDocument()
  })

  it('answers repeated clicks with a restrained acknowledgement', () => {
    render(<BonCompanion variant="compact" state="idle" />)
    const avatar = screen.getByRole('button', {
      name: 'Interagir com o Bon',
    })

    for (let click = 0; click < 4; click += 1) fireEvent.click(avatar)

    expect(screen.getByText('Eu entendi.')).toBeInTheDocument()
    expect(avatar).toHaveAttribute('data-state', 'listening')
  })

  it('takes a brief nap only after prolonged inactivity', () => {
    vi.useFakeTimers()
    vi.mocked(usePreferences).mockReturnValue({
      data: { ...visiblePreferences, buddy_reduced_motion: true },
    } as never)
    render(<BonCompanion variant="compact" state="idle" />)
    const avatar = screen.getByRole('button', {
      name: 'Interagir com o Bon',
    })

    act(() => vi.advanceTimersByTime(180_000))

    expect(avatar).toHaveAttribute('data-state', 'napping')
  })
})
