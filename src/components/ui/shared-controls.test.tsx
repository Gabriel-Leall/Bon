import { useState } from 'react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Switch } from '@/components/ui/switch'
import { render, screen } from '@/test/test-utils'
import { applyDocumentAppearance } from '@/lib/theme'

const themes = ['light', 'dark', 'cream'] as const
const accents = ['blue', 'purple', 'red'] as const
const appearanceCombinations = themes.flatMap(theme =>
  accents.map(accent => ({ theme, accent }))
)

afterEach(() => {
  document.documentElement.classList.remove('light', 'dark', 'cream')
  delete document.documentElement.dataset.axisThemeMode
  delete document.documentElement.dataset.axisAccent
})

describe('shared control appearance', () => {
  it.each(appearanceCombinations)(
    'keeps semantic focus treatment in $theme with $accent accent',
    ({ theme, accent }) => {
      applyDocumentAppearance({ theme, accent })

      render(
        <div>
          <Button>Salvar</Button>
          <Input aria-label="Título" />
          <Checkbox aria-label="Concluída" />
        </div>
      )

      expect(document.documentElement).toHaveClass(theme)
      expect(document.documentElement).toHaveAttribute(
        'data-axis-accent',
        accent
      )
      expect(screen.getByRole('button', { name: 'Salvar' })).toHaveClass(
        'focus-visible:shadow-focus-ring',
        'shadow-neu-raised-sm'
      )
      expect(screen.getByRole('textbox', { name: 'Título' })).toHaveClass(
        'focus-visible:shadow-focus-input',
        'shadow-neu-pressed'
      )
      expect(screen.getByRole('checkbox', { name: 'Concluída' })).toHaveClass(
        'focus-visible:shadow-focus-ring'
      )
    }
  )

  it('uses explicit disabled surfaces instead of opacity alone', () => {
    render(
      <div>
        <Button disabled>Salvar</Button>
        <Input aria-label="Título" disabled />
        <Switch aria-label="Sincronizar" disabled />
      </div>
    )

    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveClass(
      'disabled:bg-muted',
      'disabled:text-foreground-disabled',
      'disabled:opacity-100'
    )
    expect(screen.getByRole('textbox', { name: 'Título' })).toHaveClass(
      'disabled:bg-surface-sunken',
      'disabled:text-foreground-disabled',
      'disabled:opacity-100'
    )
    expect(screen.getByRole('switch', { name: 'Sincronizar' })).toHaveClass(
      'disabled:bg-surface-sunken',
      'disabled:border-border-subtle',
      'disabled:opacity-100'
    )
  })

  it('uses pressed and raised depth to communicate control state', () => {
    render(
      <div>
        <Button variant="outline">Opções</Button>
        <RadioGroup defaultValue="today" aria-label="Quando">
          <RadioGroupItem value="today" aria-label="Hoje" />
        </RadioGroup>
        <Switch aria-label="Sincronizar" />
      </div>
    )

    expect(screen.getByRole('button', { name: 'Opções' })).toHaveClass(
      'shadow-neu-raised-sm',
      'active:shadow-neu-pressed'
    )
    expect(screen.getByRole('radio', { name: 'Hoje' })).toHaveClass(
      'shadow-neu-raised-sm',
      'data-[state=checked]:shadow-neu-pressed'
    )
    expect(screen.getByRole('switch', { name: 'Sincronizar' })).toHaveClass(
      'shadow-neu-pressed'
    )
  })

  it('keeps destructive meaning independent from a red accent', () => {
    applyDocumentAppearance({ theme: 'dark', accent: 'red' })

    render(
      <div>
        <Input aria-label="Nome" aria-invalid="true" />
        <Badge variant="destructive">Campo obrigatório</Badge>
      </div>
    )

    expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveClass(
      'aria-invalid:border-destructive',
      'aria-invalid:shadow-error-input'
    )
    expect(screen.getByText('Campo obrigatório')).toHaveClass(
      'border-destructive/30',
      'text-destructive'
    )
  })
})

describe('shared control keyboard interaction', () => {
  it('toggles checkbox and switch with the Space key', async () => {
    const user = userEvent.setup()

    render(
      <div>
        <Checkbox aria-label="Concluída" />
        <Switch aria-label="Sincronizar" />
      </div>
    )

    const checkbox = screen.getByRole('checkbox', { name: 'Concluída' })
    checkbox.focus()
    await user.keyboard(' ')
    expect(checkbox).toHaveAttribute('aria-checked', 'true')

    const switchControl = screen.getByRole('switch', { name: 'Sincronizar' })
    switchControl.focus()
    await user.keyboard(' ')
    expect(switchControl).toHaveAttribute('aria-checked', 'true')
  })

  it('moves and selects radio options with arrow keys', async () => {
    const user = userEvent.setup()

    render(
      <RadioGroup defaultValue="today" aria-label="Quando">
        <RadioGroupItem value="today" aria-label="Hoje" />
        <RadioGroupItem value="tomorrow" aria-label="Amanhã" />
      </RadioGroup>
    )

    const today = screen.getByRole('radio', { name: 'Hoje' })
    const tomorrow = screen.getByRole('radio', { name: 'Amanhã' })
    today.focus()
    await user.keyboard('{ArrowRight} ')

    expect(tomorrow).toHaveFocus()
    expect(tomorrow).toHaveAttribute('aria-checked', 'true')
  })

  it('announces and preserves a single segmented selection', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    function Example() {
      const [value, setValue] = useState('day')

      return (
        <div>
          <SegmentedControl
            aria-label="Período da análise"
            value={value}
            options={[
              { value: 'day', label: 'Dia' },
              { value: 'week', label: 'Semana' },
              { value: 'month', label: 'Mês' },
            ]}
            onValueChange={nextValue => {
              onChange(nextValue)
              setValue(nextValue)
            }}
          />
          <output aria-live="polite">{value}</output>
        </div>
      )
    }

    render(<Example />)

    const day = screen.getByRole('radio', { name: 'Dia' })
    const week = screen.getByRole('radio', { name: 'Semana' })

    expect(day).toHaveAttribute('aria-checked', 'true')
    day.focus()
    await user.keyboard('{ArrowRight} ')

    expect(week).toHaveFocus()
    expect(week).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('week')
    expect(onChange).toHaveBeenLastCalledWith('week')

    await user.keyboard(' ')
    expect(week).toHaveAttribute('aria-checked', 'true')
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})
