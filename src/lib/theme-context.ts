import { createContext } from 'react'
import type { ResolvedTheme } from '@/lib/theme'

export type { ResolvedTheme }

export type Theme = 'dark' | 'light' | 'cream' | 'system'
export type Accent = 'blue' | 'purple' | 'red'

export interface ThemeProviderState {
  theme: Theme
  accent: Accent
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  setAccent: (accent: Accent) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  accent: 'blue',
  resolvedTheme: 'light',
  setTheme: () => null,
  setAccent: () => null,
}

export const ThemeProviderContext =
  createContext<ThemeProviderState>(initialState)
