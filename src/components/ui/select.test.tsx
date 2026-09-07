import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  })
})

describe('Select', () => {
  it('keeps its portaled menu above modal content', async () => {
    const user = userEvent.setup()

    render(
      <Select defaultValue="dark">
        <SelectTrigger aria-label="Tema">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Claro</SelectItem>
          <SelectItem value="dark">Escuro</SelectItem>
        </SelectContent>
      </Select>
    )

    const trigger = screen.getByRole('combobox', { name: 'Tema' })
    trigger.focus()
    await user.keyboard('{Enter}')

    expect(
      await screen.findByRole('option', { name: 'Claro' })
    ).toBeInTheDocument()
    expect(document.querySelector('[data-slot="select-content"]')).toHaveClass(
      'z-50'
    )
  })
})
