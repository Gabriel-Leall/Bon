import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sendTargetedNativeNotification } from './native-notification'
import { decodeAxisNotificationTarget } from './notification-target'

describe('sendTargetedNativeNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(isPermissionGranted).mockResolvedValue(true)
    vi.mocked(requestPermission).mockResolvedValue('granted')
  })

  it('stores a typed destination in the native payload', async () => {
    await sendTargetedNativeNotification({
      title: 'Your day is still open',
      body: 'Review it now.',
      target: { kind: 'wrap-up' },
    })

    expect(sendNotification).toHaveBeenCalledOnce()
    const options = vi.mocked(sendNotification).mock.calls[0]?.[0]
    expect(typeof options).toBe('object')
    if (typeof options !== 'object') throw new Error('Expected options payload')
    expect(decodeAxisNotificationTarget(options.extra)).toEqual({
      kind: 'wrap-up',
    })
  })

  it('does not send when the operating system permission remains denied', async () => {
    vi.mocked(isPermissionGranted).mockResolvedValue(false)
    vi.mocked(requestPermission).mockResolvedValue('denied')

    await expect(
      sendTargetedNativeNotification({
        title: 'Reminder',
        target: { kind: 'focus' },
      })
    ).rejects.toThrow('permission')
    expect(sendNotification).not.toHaveBeenCalled()
  })
})
