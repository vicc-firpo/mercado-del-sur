import { buildPath, ROUTES } from '@/constants/routes'
import { getApiErrorMessage } from '@/helpers/get-api-error'
import { clearPendingOrderId, getPendingOrderId } from '@/lib/pending-order'
import { useGetOrderByIdQuery } from '@/store'
import { cartApi } from '@/store/apis/cart-api'
import { ordersApi } from '@/store/apis/orders-api'
import {
  Alert,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { skipToken } from '@reduxjs/toolkit/query'
import { IconCircleCheck, IconClock } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Link, Navigate } from 'react-router-dom'

const POLL_INTERVAL_MS = 2000
const MAX_ATTEMPTS = 10

export default function CheckoutSuccessPage() {
  const { t } = useTranslation('checkout')
  const dispatch = useDispatch()
  const orderId = useMemo(() => getPendingOrderId(), [])
  const [attempts, setAttempts] = useState(0)

  const gaveUp = attempts >= MAX_ATTEMPTS

  const { data: order, error } = useGetOrderByIdQuery(orderId ?? skipToken, {
    pollingInterval: gaveUp ? 0 : POLL_INTERVAL_MS,
  })

  const isPaid = order?.isPaid === true
  const settled = isPaid || gaveUp

  useEffect(() => {
    if (!orderId || isPaid) return
    const id = setInterval(() => setAttempts((n) => n + 1), POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [orderId, isPaid])

  useEffect(() => {
    if (!isPaid) return
    clearPendingOrderId()
    dispatch(cartApi.util.invalidateTags(['RETRIEVED_CART']))
    dispatch(ordersApi.util.invalidateTags(['RETRIEVED_ORDERS']))
  }, [isPaid, dispatch])

  if (!orderId) {
    return <Navigate to={ROUTES.ORDERS} replace />
  }

  if (error) {
    return (
      <Container size="sm" py="xl">
        <Alert color="red" title={t('loadError')}>
          {getApiErrorMessage(error, t('unexpectedError', { ns: 'common' }))}
        </Alert>
        <Button component={Link} to={ROUTES.ORDERS} mt="md">
          {t('goToOrders')}
        </Button>
      </Container>
    )
  }

  if (!settled) {
    return (
      <Container size="sm" py={80}>
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Title order={3} ta="center">
              {t('confirmingTitle')}
            </Title>
            <Text c="dimmed" ta="center">
              {t('confirmingText')}
            </Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  if (gaveUp && !isPaid) {
    return (
      <Container size="sm" py={80}>
        <Center>
          <Stack align="center" gap="md">
            <ThemeIcon size={64} radius="xl" variant="light" color="yellow">
              <IconClock size={40} />
            </ThemeIcon>
            <Title order={2} ta="center">
              {t('pendingTitle')}
            </Title>
            <Text c="dimmed" ta="center" maw={420}>
              {t('pendingText')}
            </Text>
            <Button component={Link} to={ROUTES.ORDERS} mt="sm">
              {t('goToOrders')}
            </Button>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="sm" py={80}>
      <Center>
        <Stack align="center" gap="md">
          <ThemeIcon size={64} radius="xl" variant="light" color="green">
            <IconCircleCheck size={40} />
          </ThemeIcon>
          <Title order={2} ta="center">
            {t('successTitle')}
          </Title>
          <Text c="dimmed" ta="center" maw={420}>
            {t('successText', { id: orderId.slice(0, 8).toUpperCase() })}
          </Text>
          <Group mt="sm">
            <Button
              component={Link}
              to={buildPath(ROUTES.ORDER_DETAIL, { id: orderId })}
            >
              {t('viewOrder')}
            </Button>
            <Button component={Link} to={ROUTES.CATALOG} variant="light">
              {t('keepShopping')}
            </Button>
          </Group>
        </Stack>
      </Center>
    </Container>
  )
}
