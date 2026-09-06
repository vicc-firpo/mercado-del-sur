import { CartItemRow } from '@/components/cart-item-row/CartItemRow'
import { buildPath, ROUTES } from '@/constants/routes'
import { formatPrice } from '@/helpers/format-price'
import { getApiErrorMessage } from '@/helpers/get-api-error'
import { showNotification } from '@/helpers/show-notification'
import { useCheckoutMutation, useGetCartQuery } from '@/store'
import {
  Alert,
  Anchor,
  Box,
  Button,
  Card,
  Center,
  Container,
  Divider,
  Group,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import {
  IconArrowLeft,
  IconCreditCard,
  IconShoppingCartX,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

/** Alto fijo de la lista de ítems: siempre el mismo, muestra ~3 productos y hace scroll a partir de ahí. */
const LIST_HEIGHT = 500

export default function CartPage() {
  const { t } = useTranslation('cart')
  const navigate = useNavigate()
  const { data: cart, isLoading, error } = useGetCartQuery()
  const [checkout, { isLoading: isCheckingOut }] = useCheckoutMutation()

  const handleCheckout = async () => {
    try {
      const order = await checkout().unwrap()
      showNotification({
        type: 'success',
        title: t('checkoutSuccessTitle'),
        message: t('checkoutSuccess'),
      })
      navigate(buildPath(ROUTES.ORDER_DETAIL, { id: order.id }))
    } catch (err) {
      showNotification({
        type: 'error',
        title: t('errorTitle', { ns: 'common' }),
        message: getApiErrorMessage(err, t('checkoutError')),
      })
    }
  }

  if (isLoading) {
    return (
      <Container size="xl" py="md">
        <Skeleton h={32} w={180} mb="lg" radius="sm" />
        <Group align="flex-start" gap="xl" wrap="wrap">
          <Stack gap="lg" style={{ flex: 1, minWidth: 280 }}>
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} h={110} radius="md" />
            ))}
          </Stack>
          <Skeleton h={280} w={320} radius="md" />
        </Group>
      </Container>
    )
  }

  if (error) {
    return (
      <Container size="xl" py="md">
        <Alert color="red" title={t('loadError')}>
          {getApiErrorMessage(error, t('unexpectedError', { ns: 'common' }))}
        </Alert>
      </Container>
    )
  }

  const items = cart?.items ?? []
  const total = cart?.total ?? 0
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const isEmpty = items.length === 0

  return (
    <Container size="xl" py="md">
      <Title order={2} mb="lg">
        {t('title')}
      </Title>

      <Group align="stretch" gap="xl" wrap="wrap">
        <Card withBorder radius="md" p="lg" style={{ flex: 1, minWidth: 280 }}>
          {isEmpty ? (
            <Center h={LIST_HEIGHT}>
              <Stack align="center" gap="md">
                <IconShoppingCartX
                  size={64}
                  stroke={1.2}
                  color="var(--mantine-color-gray-5)"
                />
                <Text c="dimmed" ta="center">
                  {t('empty')}
                </Text>
                <Anchor
                  component={Link}
                  to={ROUTES.CATALOG}
                  size="sm"
                  c="blue"
                  underline="never"
                  mt="sm"
                >
                  <Group gap={4} wrap="nowrap">
                    <IconArrowLeft size={14} />
                    {t('emptyCta')}
                  </Group>
                </Anchor>
              </Stack>
            </Center>
          ) : (
            <ScrollArea h={LIST_HEIGHT} type="auto" offsetScrollbars="present">
              <Stack gap="lg" pr="sm">
                {items.map((item, index) => (
                  <Box key={item.product.id}>
                    {index > 0 && <Divider mb="lg" />}
                    <CartItemRow item={item} />
                  </Box>
                ))}
              </Stack>
            </ScrollArea>
          )}
        </Card>

        <Card
          withBorder
          radius="md"
          p="lg"
          style={{
            width: 340,
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack gap="sm" style={{ flex: 1 }}>
            <Title order={3}>{t('summary')}</Title>

            <Group justify="space-between">
              <Text c="dimmed">{t('itemCount', { count: itemCount })}</Text>
              <Text>{formatPrice(total)}</Text>
            </Group>

            <Group justify="space-between">
              <Text c="dimmed">{t('shipping')}</Text>
              <Text c="green.7" fw={600}>
                {t('shippingToBeCalculated')}
              </Text>
            </Group>

            <Divider />

            <Group justify="space-between" align="baseline">
              <Text fw={700}>{t('total')}</Text>
              <Text fz={24} fw={700} c="black">
                {formatPrice(total)}
              </Text>
            </Group>

            <Box style={{ flex: 1 }} />

            <Button
              fullWidth
              size="md"
              mt="sm"
              leftSection={<IconCreditCard size={18} />}
              loading={isCheckingOut}
              disabled={isEmpty}
              onClick={handleCheckout}
            >
              {t('checkoutCta')}
            </Button>
          </Stack>
        </Card>
      </Group>
    </Container>
  )
}
