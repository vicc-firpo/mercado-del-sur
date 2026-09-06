import { Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'

const ITEM_COUNT = 3

export function TrustHighlights() {
  const { t } = useTranslation('catalog')

  const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
    number: i + 1,
    title: t(`highlights.item${i + 1}.title`),
    text: t(`highlights.item${i + 1}.text`),
  }))

  return (
    <Paper radius="lg" p={{ base: 'lg', sm: 40 }} bg="secondary.0" withBorder>
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={{ base: 'lg', sm: 40 }}>
        {items.map((item) => (
          <Stack key={item.number} gap="xs">
            <ThemeIcon radius="xl" size={38} variant="light" color="secondary">
              <Text fw={600} size="sm">
                {item.number}
              </Text>
            </ThemeIcon>
            <Title order={4} c="black">
              {item.title}
            </Title>
            <Text size="sm" c="dimmed">
              {item.text}
            </Text>
          </Stack>
        ))}
      </SimpleGrid>
    </Paper>
  )
}
