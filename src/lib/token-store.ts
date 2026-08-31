/**
 * Secure token store wrapper backed by the operating system credential store.
 *
 * Legacy plugin-store entries are read once and removed only after their value
 * has been persisted securely, so existing OAuth sessions do not break.
 */

import type { Store } from '@tauri-apps/plugin-store'
import { commands, unwrapResult } from '@/lib/tauri-bindings'
import { logger } from '@/lib/logger'

const LEGACY_TOKEN_STORE_FILE = 'auth.json'

export const TOKEN_KEYS = {
  GITHUB: 'github_token',
  SLACK: 'slack_token',
  GOOGLE: 'google_token',
  GOOGLE_REFRESH: 'google_refresh_token',
  GITHUB_STATE: 'github_oauth_state',
  SLACK_STATE: 'slack_oauth_state',
  GOOGLE_STATE: 'google_oauth_state',
  GOOGLE_CODE_VERIFIER: 'google_oauth_code_verifier',
} as const

export type TokenKey = (typeof TOKEN_KEYS)[keyof typeof TOKEN_KEYS]

let legacyStore: Store | null = null

async function getLegacyStore(): Promise<Store> {
  if (!legacyStore) {
    const { Store } = await import('@tauri-apps/plugin-store')
    legacyStore = await Store.load(LEGACY_TOKEN_STORE_FILE)
  }
  return legacyStore
}

async function removeLegacyToken(key: TokenKey): Promise<void> {
  try {
    const store = await getLegacyStore()
    await store.delete(key)
    await store.save()
  } catch (error) {
    logger.warn('Failed to remove legacy credential after secure migration', {
      key,
      error,
    })
  }
}

async function migrateLegacyToken(key: TokenKey): Promise<string | null> {
  try {
    const store = await getLegacyStore()
    const value = await store.get<string>(key)
    if (!value) return null

    await saveToken(key, value)
    await removeLegacyToken(key)
    return value
  } catch (error) {
    logger.warn('Failed to migrate legacy credential', { key, error })
    return null
  }
}

export async function saveToken(key: TokenKey, token: string): Promise<void> {
  unwrapResult(await commands.saveCredential(key, token))
}

export async function loadToken(key: TokenKey): Promise<string | null> {
  try {
    const value = unwrapResult(await commands.getCredential(key))
    return value ?? (await migrateLegacyToken(key))
  } catch (error) {
    logger.warn('Failed to load secure credential', { key, error })
    return null
  }
}

export async function deleteToken(key: TokenKey): Promise<void> {
  unwrapResult(await commands.deleteCredential(key))
  await removeLegacyToken(key)
}
