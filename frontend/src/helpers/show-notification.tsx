import { notifications } from '@mantine/notifications'
import { IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react'
import type { ReactNode } from 'react'

export type NotificationType = 'success' | 'error' | 'alert'

interface ShowNotificationProps {
  title: string
  message: string
  type: NotificationType
}

const notificationConfig: Record<
  NotificationType,
  { icon: ReactNode; color: string }
> = {
  success: { icon: <IconCheck size={18} />, color: 'green' },
  error: { icon: <IconX size={18} />, color: 'red' },
  alert: { icon: <IconInfoCircle size={18} />, color: 'yellow' },
}

export function showNotification({
  title,
  message,
  type,
}: ShowNotificationProps) {
  const { icon, color } = notificationConfig[type]
  notifications.show({
    icon,
    title,
    message,
    color,
    styles: {
      icon: {
        backgroundColor: `var(--mantine-color-${color}-1)`,
        color: `var(--mantine-color-${color}-filled)`,
      },
    },
  })
}
