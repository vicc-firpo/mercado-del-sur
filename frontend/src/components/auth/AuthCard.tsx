import { Container, Paper, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'

interface AuthCardProps {
  title: string
  subtitle: string
  footer: ReactNode
  children: ReactNode
}

export function AuthCard({ title, subtitle, footer, children }: AuthCardProps) {
  return (
    <Container size={420} py={48}>
      <Title order={2} ta="center">
        {title}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt="xs">
        {subtitle}
      </Text>

      <Paper withBorder shadow="md" p="xl" mt="xl" radius="md">
        {children}
      </Paper>

      <Text c="dimmed" size="sm" ta="center" mt="lg">
        {footer}
      </Text>
    </Container>
  )
}
