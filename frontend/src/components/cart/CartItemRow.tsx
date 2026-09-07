import { ProductThumbnail } from '@/components/product/ProductThumbnail'
import { buildPath, ROUTES } from '@/constants/routes'
import { formatPrice } from '@/helpers/format-price'
import { getApiErrorMessage } from '@/helpers/get-api-error'
import { showNotification } from '@/helpers/show-notification'
import { useAddCartItemMutation, useRemoveCartItemMutation } from '@/store'
import type { CartItem } from '@/types/cart/cart'
import { ActionIcon, Anchor, Box, Group, Stack, Text } from '@mantine/core'
import {
  IconArrowRight,
  IconMinus,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const MAX_QUANTITY = 99

export function CartItemRow({ item }: { item: CartItem }) {
  const { t } = useTranslation('cart')
  const { product, quantity, subtotal } = item
  const detailPath = buildPath(ROUTES.PRODUCT_DETAIL, { id: product.id })

  const [setQuantity, { isLoading: isUpdating }] = useAddCartItemMutation()
  const [removeItem, { isLoading: isRemoving }] = useRemoveCartItemMutation()
  const isBusy = isUpdating || isRemoving

  const changeQuantity = async (next: number) => {
    if (next < 1 || next > MAX_QUANTITY || next === quantity) return
    try {
      await setQuantity({ productId: product.id, quantity: next }).unwrap()
    } catch (err) {
      showNotification({
        type: 'error',
        title: t('errorTitle', { ns: 'common' }),
        message: getApiErrorMessage(err, t('updateError')),
      })
    }
  }

  const remove = async () => {
    try {
      await removeItem(product.id).unwrap()
    } catch (err) {
      showNotification({
        type: 'error',
        title: t('errorTitle', { ns: 'common' }),
        message: getApiErrorMessage(err, t('removeError')),
      })
    }
  }

  return (
    <Group wrap="nowrap" align="stretch" gap="md">
      <Box
        component={Link}
        to={detailPath}
        w={96}
        style={{
          flexShrink: 0,
          alignSelf: 'stretch',
          borderRadius: 'var(--mantine-radius-md)',
          overflow: 'hidden',
        }}
      >
        <ProductThumbnail product={product} height="100%" />
      </Box>

      <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
        <Group justify="space-between" wrap="nowrap" gap="sm" align="flex-start">
          <Text fw={600} c="black" lineClamp={1}>
            {product.name}
          </Text>
          <Anchor
            component={Link}
            to={detailPath}
            size="sm"
            c="blue"
            underline="never"
            style={{ flexShrink: 0 }}
          >
            <Group gap={4} wrap="nowrap">
              {t('viewDetail', { ns: 'catalog' })}
              <IconArrowRight size={14} />
            </Group>
          </Anchor>
        </Group>

        <Text
          size="sm"
          c="dimmed"
          lineClamp={1}
          fs={product.description ? undefined : 'italic'}
        >
          {product.description ?? t('noDescription', { ns: 'products' })}
        </Text>

        <Text size="sm" c="dimmed">
          {t('unitPrice')}: {formatPrice(product.price)}
        </Text>

        <Group gap="sm" mt={4} justify="space-between" wrap="wrap">
          <Group gap={4} wrap="nowrap">
            <ActionIcon
              variant="default"
              size="lg"
              aria-label={t('decrease')}
              disabled={isBusy || quantity <= 1}
              onClick={() => changeQuantity(quantity - 1)}
            >
              <IconMinus size={16} />
            </ActionIcon>
            <Text w={32} ta="center" fw={600}>
              {quantity}
            </Text>
            <ActionIcon
              variant="default"
              size="lg"
              aria-label={t('increase')}
              disabled={isBusy || quantity >= MAX_QUANTITY}
              onClick={() => changeQuantity(quantity + 1)}
            >
              <IconPlus size={16} />
            </ActionIcon>

            <ActionIcon
              variant="subtle"
              color="red"
              size="lg"
              ml="xs"
              aria-label={t('remove')}
              loading={isRemoving}
              disabled={isBusy}
              onClick={remove}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>

          <Text fw={700} c="black" style={{ whiteSpace: 'nowrap' }}>
            {formatPrice(subtotal)}
          </Text>
        </Group>
      </Stack>
    </Group>
  )
}
