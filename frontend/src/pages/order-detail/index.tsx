import { ROUTES } from '@/constants/routes'
import { formatDate } from '@/helpers/format-date'
import { formatPrice } from '@/helpers/format-price'
import { getApiErrorMessage } from '@/helpers/get-api-error'
import { useGetOrderByIdQuery } from '@/store'
import {
  Alert,
  Anchor,
  Button,
  Container,
  Divider,
  Group,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { skipToken } from '@reduxjs/toolkit/query'
import { IconArrowLeft } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

export default function OrderDetailPage() {
  const { t } = useTranslation('orders')
  const { id } = useParams()
  const {
    data: order,
    isLoading,
    error,
  } = useGetOrderByIdQuery(id ?? skipToken)

  if (isLoading) {
    return (
      <Container size="md" py="md">
        <Skeleton h={32} w={220} mb="lg" radius="sm" />
        <Skeleton h={200} radius="md" />
      </Container>
    )
  }

  if (error) {
    const isNotFound = 'status' in error && error.status === 404

    if (isNotFound) {
      return (
        <Container size="sm" py="xl" ta="center">
          <Title order={2}>{t('notFoundTitle')}</Title>
          <Text c="dimmed" my="md">
            {t('notFoundText')}
          </Text>
          <Button component={Link} to={ROUTES.ORDERS}>
            {t('backToOrders')}
          </Button>
        </Container>
      )
    }

    return (
      <Container size="md" py="md">
        <Alert color="red" title={t('loadError')}>
          {getApiErrorMessage(error, t('unexpectedError', { ns: 'common' }))}
        </Alert>
      </Container>
    )
  }

  if (!order) return null

  return (
    <Container size="md" py="md">
      <Stack gap="lg">
        <Anchor
          component={Link}
          to={ROUTES.ORDERS}
          size="sm"
          c="blue"
          underline="never"
        >
          <Group gap={4} wrap="nowrap">
            <IconArrowLeft size={14} />
            {t('backToOrders')}
          </Group>
        </Anchor>

        <Stack gap={4}>
          <Title order={2}>
            {t('orderNumber', { id: order.id.slice(0, 8).toUpperCase() })}
          </Title>
          <Text c="dimmed">
            {t('date')}: {formatDate(order.createdAt)}
          </Text>
        </Stack>

        <Table.ScrollContainer minWidth={480}>
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('product')}</Table.Th>
                <Table.Th ta="center">{t('quantity')}</Table.Th>
                <Table.Th ta="right">{t('unitPrice')}</Table.Th>
                <Table.Th ta="right">{t('subtotal')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {order.items.map((item, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    <Text fw={500}>{item.productName}</Text>
                    {item.productDescription && (
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {item.productDescription}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td ta="center">{item.quantity}</Table.Td>
                  <Table.Td ta="right">{formatPrice(item.unitPrice)}</Table.Td>
                  <Table.Td ta="right">{formatPrice(item.subtotal)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <Divider />

        <Group justify="flex-end" align="baseline" gap="md">
          <Text fw={700}>{t('total')}</Text>
          <Text fz={24} fw={700} c="black">
            {formatPrice(order.total)}
          </Text>
        </Group>
      </Stack>
    </Container>
  )
}
