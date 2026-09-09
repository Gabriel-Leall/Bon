import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification'
import {
  encodeAxisNotificationTarget,
  type AxisNotificationTarget,
} from './notification-target'

export async function sendTargetedNativeNotification({
  title,
  body,
  target,
}: {
  title: string
  body?: string
  target: AxisNotificationTarget
}) {
  let permissionGranted = await isPermissionGranted()

  if (!permissionGranted) {
    permissionGranted = (await requestPermission()) === 'granted'
  }

  if (!permissionGranted) {
    throw new Error('Native notification permission was not granted')
  }

  sendNotification({
    title,
    body,
    autoCancel: true,
    group: 'axis-reminders',
    extra: encodeAxisNotificationTarget(target),
  })
}
