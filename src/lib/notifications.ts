/**
 * Simple notification system supporting both in-app toasts and native system notifications
 */

import { toast } from 'sonner'
import { logger } from './logger'
import { sendTargetedNativeNotification } from './native-notification'
import type { AxisNotificationTarget } from './notification-target'
import { shouldAxisNotifyForCalendarEvent } from './calendar-notification-policy'
import { commands } from './tauri-bindings'

type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface NotificationOptions {
  /** Type of notification (affects styling) */
  type?: NotificationType
  /** Send as native system notification instead of toast */
  native?: boolean
  /** Duration in milliseconds for toasts (0 = no auto-dismiss) */
  duration?: number
  /** Context opened when the user activates a native notification. */
  target?: AxisNotificationTarget
  /** Explicit opt-in for alerts owned by a connected calendar provider. */
  allowExternalCalendarNotification?: boolean
}

function showToast(
  title: string,
  message: string | undefined,
  type: NotificationType,
  duration: number | undefined
) {
  const toastContent = message ? `${title}: ${message}` : title
  const toastOptions = duration !== undefined ? { duration } : {}

  switch (type) {
    case 'success':
      toast.success(toastContent, toastOptions)
      break
    case 'error':
      toast.error(toastContent, toastOptions)
      break
    case 'warning':
      toast.warning(toastContent, toastOptions)
      break
    case 'info':
      toast.info(toastContent, toastOptions)
      break
  }
}

/**
 * Send a notification - either as an in-app toast or native system notification
 *
 * @param title - Main notification title
 * @param message - Optional message body
 * @param options - Notification configuration
 *
 * @example
 * ```typescript
 * // Simple toast
 * notify('Success!', 'File saved successfully')
 *
 * // Error toast
 * notify('Error', 'Failed to save file', { type: 'error' })
 *
 * // Native system notification
 * notify('Update Available', 'A new version is ready to install', { native: true })
 * ```
 */
export async function notify(
  title: string,
  message?: string,
  options: NotificationOptions = {}
): Promise<void> {
  const {
    type = 'info',
    native = false,
    duration,
    target,
    allowExternalCalendarNotification = false,
  } = options

  if (
    native &&
    target?.kind === 'calendar-event' &&
    !shouldAxisNotifyForCalendarEvent(
      target.owner,
      allowExternalCalendarNotification
    )
  ) {
    logger.debug('Skipped notification owned by an external calendar', {
      target,
    })
    return
  }

  try {
    if (native) {
      // Send native system notification via Tauri
      logger.debug('Sending native notification', {
        title,
        message,
        type,
        target,
      })
      if (target) {
        await sendTargetedNativeNotification({
          title,
          body: message,
          target,
        })
      } else {
        const result = await commands.sendNativeNotification(
          title,
          message ?? null
        )
        if (result.status === 'error') {
          throw new Error(result.error)
        }
      }
    } else {
      // Send in-app toast notification
      logger.debug('Sending toast notification', { title, message, type })
      showToast(title, message, type, duration)
    }
  } catch (error) {
    logger.error('Failed to send notification', { title, message, error })
    // Fallback to toast if native notification fails
    if (native) {
      showToast(title, message, type, duration)
    }
  }
}

/**
 * Convenience functions for common notification types
 */
export const notifications = {
  /** Show success notification */
  success: (title: string, message?: string, native?: boolean) =>
    notify(title, message, { type: 'success', native }),

  /** Show error notification */
  error: (title: string, message?: string, native?: boolean) =>
    notify(title, message, { type: 'error', native }),

  /** Show info notification */
  info: (title: string, message?: string, native?: boolean) =>
    notify(title, message, { type: 'info', native }),

  /** Show warning notification */
  warning: (title: string, message?: string, native?: boolean) =>
    notify(title, message, { type: 'warning', native }),
}

// Export individual convenience functions
export const { success, error, info, warning } = notifications
