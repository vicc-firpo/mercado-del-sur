import { ActionIcon, Box, Group, Stack, Text, Title } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const SLIDE_COUNT = 3
const AUTOPLAY_MS = 6000

export function PromoCarousel() {
  const { t } = useTranslation('catalog')
  const [index, setIndex] = useState(0)

  const goTo = useCallback((next: number) => {
    setIndex((next + SLIDE_COUNT) % SLIDE_COUNT)
  }, [])

  useEffect(() => {
    const id = setInterval(
      () => setIndex((current) => (current + 1) % SLIDE_COUNT),
      AUTOPLAY_MS,
    )
    return () => clearInterval(id)
  }, [index])

  const slides = Array.from({ length: SLIDE_COUNT }, (_, i) => ({
    eyebrow: t(`promo.slide${i + 1}.eyebrow`),
    title: t(`promo.slide${i + 1}.title`),
    text: t(`promo.slide${i + 1}.text`),
  }))
  const current = slides[index]

  return (
    <Box
      pos="relative"
      p={{ base: 'lg', sm: 40 }}
      h={{ base: 380, xs: 300, sm: 250 }}
      style={{
        overflow: 'hidden',
        borderRadius: 'var(--mantine-radius-md)',
        color: 'var(--mantine-color-white)',
        background:
          'linear-gradient(90deg, var(--mantine-color-primary-7) 0%, var(--mantine-color-primary-5) 100%)',
      }}
    >
      <Stack gap="xs" maw={560}>
        <Text
          size="xs"
          fw={700}
          tt="uppercase"
          style={{ letterSpacing: 1.5, opacity: 0.75 }}
        >
          {current.eyebrow}
        </Text>
        <Title order={2} c="white" lineClamp={3}>
          {current.title}
        </Title>
        <Text lineClamp={3} style={{ opacity: 0.85 }}>
          {current.text}
        </Text>
      </Stack>

      <Group
        gap={6}
        pos="absolute"
        left="var(--mantine-spacing-lg)"
        bottom={20}
      >
        {slides.map((slide, i) => (
          <Box
            key={slide.eyebrow}
            role="button"
            tabIndex={0}
            aria-label={slide.eyebrow}
            onClick={() => goTo(i)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') goTo(i)
            }}
            style={{
              width: i === index ? 22 : 8,
              height: 8,
              borderRadius: 999,
              cursor: 'pointer',
              transition: 'width 150ms ease',
              background:
                i === index
                  ? 'var(--mantine-color-white)'
                  : 'rgba(255, 255, 255, 0.4)',
            }}
          />
        ))}
      </Group>

      <Group gap={4} pos="absolute" right={16} bottom={16}>
        <ActionIcon
          variant="white"
          color="dark"
          radius="xl"
          onClick={() => goTo(index - 1)}
          aria-label={t('promo.prev')}
        >
          <IconChevronLeft size={16} />
        </ActionIcon>
        <ActionIcon
          variant="white"
          color="dark"
          radius="xl"
          onClick={() => goTo(index + 1)}
          aria-label={t('promo.next')}
        >
          <IconChevronRight size={16} />
        </ActionIcon>
      </Group>
    </Box>
  )
}
