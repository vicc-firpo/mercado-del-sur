import { Container, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'

export function PagePlaceholder({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) {
  return (
    <Container size="lg" py="md">
      <Title order={2} mb="sm">
        {title}
      </Title>
      <Text c="dimmed">
        {children ?? 'Pantalla pendiente de implementación.'}
      </Text>
    </Container>
  )
}
