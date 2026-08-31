import { beforeEach, describe, expect, it, vi } from 'vitest'
import { commands } from '@/lib/tauri-bindings'
import { TOKEN_KEYS, deleteToken, loadToken, saveToken } from './token-store'

vi.mock('@tauri-apps/plugin-store', () => ({
  Store: {
    load: vi.fn().mockResolvedValue({
      get: vi.fn().mockResolvedValue(null),
      delete: vi.fn().mockResolvedValue(undefined),
      save: vi.fn().mockResolvedValue(undefined),
    }),
  },
}))

describe('token-store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('stores tokens through the secure credential command', async () => {
    await saveToken(TOKEN_KEYS.GITHUB, 'token-value')

    expect(commands.saveCredential).toHaveBeenCalledWith(
      TOKEN_KEYS.GITHUB,
      'token-value'
    )
  })

  it('reads an existing secure credential without loading legacy storage', async () => {
    vi.mocked(commands.getCredential).mockResolvedValue({
      status: 'ok',
      data: 'token-value',
    })

    await expect(loadToken(TOKEN_KEYS.GOOGLE)).resolves.toBe('token-value')
  })

  it('deletes the secure credential before cleaning legacy storage', async () => {
    await deleteToken(TOKEN_KEYS.SLACK)

    expect(commands.deleteCredential).toHaveBeenCalledWith(TOKEN_KEYS.SLACK)
  })
})
