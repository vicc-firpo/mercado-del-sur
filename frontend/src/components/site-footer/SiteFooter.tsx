import { ROUTES } from '@/constants/routes'
import {
  Anchor,
  Box,
  Container,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export function SiteFooter() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <Box
      component="footer"
      mt="xl"
      c="gray.4"
      style={{
        background:
          'linear-gradient(90deg, var(--mantine-color-primary-7) 0%, var(--mantine-color-primary-5) 100%)',
        marginInline: 'calc(var(--mantine-spacing-md) * -1)',
        marginBottom: 'calc(var(--mantine-spacing-md) * -1)',
      }}
    >
      <Container size="xl" py="xl">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
          <Stack gap="xs">
            <Text fw={700} size="lg" c="white">
              {t('appName')}
            </Text>
            <Text size="sm" c="gray.4">
              {t('footer.tagline')}
            </Text>
          </Stack>

          <Stack gap="xs">
            <Text fw={600} size="sm" c="white">
              {t('footer.shop.title')}
            </Text>
            <Anchor component={Link} to={ROUTES.CATALOG} size="sm" c="gray.4">
              {t('footer.shop.catalog')}
            </Anchor>
            <Text size="sm" c="gray.4">
              {t('footer.shop.new')}
            </Text>
            <Text size="sm" c="gray.4">
              {t('footer.shop.bestSellers')}
            </Text>
            <Text size="sm" c="gray.4">
              {t('footer.shop.giftCards')}
            </Text>
          </Stack>

          <Stack gap="xs">
            <Text fw={600} size="sm" c="white">
              {t('footer.help.title')}
            </Text>
            <Text size="sm" c="gray.4">
              {t('footer.help.shipping')}
            </Text>
            <Text size="sm" c="gray.4">
              {t('footer.help.returns')}
            </Text>
            <Text size="sm" c="gray.4">
              {t('footer.help.faq')}
            </Text>
            <Text size="sm" c="gray.4">
              {t('footer.help.contact')}
            </Text>
          </Stack>

          <Stack gap="xs">
            <Text fw={600} size="sm" c="white">
              {t('footer.contact.title')}
            </Text>
            <Text size="sm" c="gray.4">
              {t('footer.contact.address')}
            </Text>
            <Text size="sm" c="gray.4">
              {t('footer.contact.phone')}
            </Text>
            <Anchor
              href={`mailto:${t('footer.contact.email')}`}
              size="sm"
              c="gray.4"
            >
              {t('footer.contact.email')}
            </Anchor>
            <Text size="sm" c="gray.4">
              {t('footer.contact.hours')}
            </Text>
          </Stack>
        </SimpleGrid>

        <Divider my="lg" color="primary.4" />

        <Group justify="space-between" gap="sm">
          <Text size="xs" c="gray.4">
            {t('footer.rights', { year })}
          </Text>
          <Group gap="md">
            <Text size="xs" c="gray.4">
              {t('footer.terms')}
            </Text>
            <Text size="xs" c="gray.4">
              {t('footer.privacy')}
            </Text>
          </Group>
        </Group>
      </Container>
    </Box>
  )
}
