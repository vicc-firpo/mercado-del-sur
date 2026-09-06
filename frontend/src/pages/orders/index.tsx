import { buildPath, ROUTES } from '@/constants/routes'
import { formatDate } from '@/helpers/format-date'
import { formatPrice } from '@/helpers/format-price'
import { getApiErrorMessage } from '@/helpers/get-api-error'
import { useGetMyOrdersQuery } from '@/store'
import {
  Alert,
  Anchor,
  Button,
  Card,
  Container,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconArrowRight, IconReceipt } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function OrdersPage() {
  const { t } = useTranslation('orders')
  const { data: orders, isLoading, error } = useGetMyOrdersQuery()

  if (isLoading) {
    return (
      <Container size="md" py="md">
        <Skeleton h={32} w={180} mb="lg" radius="sm" />
        <Stack gap="md">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} h={96} radius="md" />
          ))}
        </Stack>
      </Container>
    )
  }

  if (error) {
    return (
      <Container size="md" py="md">
        <Alert color="red" title={t('loadError')}>
          {getApiErrorMessage(error, t('unexpectedError', { ns: 'common' }))}
        </Alert>
      </Container>
    )
  }

  const items = orders ?? []

  if (items.length === 0) {
    return (
      <Container size="sm" py={64}>
        <Stack align="center" gap="md">
          <IconReceipt
            size={64}
            stroke={1.2}
            color="var(--mantine-color-gray-5)"
          />
          <Title order={2} ta="center">
            {t('title')}
          </Title>
          <Text c="dimmed" ta="center">
            {t('empty')}
          </Text>
          <Button component={Link} to={ROUTES.CATALOG} mt="sm">
            {t('emptyCta')}
          </Button>
        </Stack>
      </Container>
    )
  }

  return (
    <Container size="md" py="md">
      <Title order={2} mb="lg">
        {t('title')}
      </Title>

      <Stack gap="md">
        {items.map((order) => {
          const detailPath = buildPath(ROUTES.ORDER_DETAIL, { id: order.id })

          return (
            <Card key={order.id} withBorder radius="md" p="lg">
              <Group justify="space-between" wrap="nowrap" gap="md">
                <Stack gap={2} style={{ minWidth: 0 }}>
                  <Anchor
                    component={Link}
                    to={detailPath}
                    fw={600}
                    c="black"
                    underline="never"
                  >
                    {t('orderNumber', {
                      id: order.id.slice(0, 8).toUpperCase(),
                    })}
                  </Anchor>
                  <Text size="sm" c="dimmed">
                    {formatDate(order.createdAt)} ·{' '}
                    {t('itemCount', { count: order.itemCount })}
                  </Text>
                </Stack>

                <Stack gap={4} align="flex-end" style={{ flexShrink: 0 }}>
                  <Text fw={700} c="black" style={{ whiteSpace: 'nowrap' }}>
                    {formatPrice(order.total)}
                  </Text>
                  <Anchor
                    component={Link}
                    to={detailPath}
                    size="sm"
                    c="blue"
                    underline="never"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Group gap={4} wrap="nowrap">
                      {t('viewDetail')}
                      <IconArrowRight size={14} />
                    </Group>
                  </Anchor>
                </Stack>
              </Group>
            </Card>
          )
        })}
      </Stack>
    </Container>
  )
}
