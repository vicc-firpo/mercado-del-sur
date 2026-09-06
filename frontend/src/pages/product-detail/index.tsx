import { ProductGallery } from '@/components/product-gallery/ProductGallery'
import { ROUTES } from '@/constants/routes'
import { formatPrice } from '@/helpers/format-price'
import { getApiErrorMessage } from '@/helpers/get-api-error'
import { showNotification } from '@/helpers/show-notification'
import { useLoggedUser } from '@/hooks/use-logged-user'
import { useAddCartItemMutation, useGetProductByIdQuery } from '@/store'
import { skipToken } from '@reduxjs/toolkit/query'
import {
  Alert,
  Anchor,
  Button,
  Container,
  Divider,
  Group,
  NumberInput,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconArrowLeft, IconShoppingCartPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

export default function ProductDetailPage() {
  const { t } = useTranslation('products')
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useLoggedUser()

  const {
    data: product,
    isLoading,
    error,
  } = useGetProductByIdQuery(id ?? skipToken)
  const [addCartItem, { isLoading: isAdding }] = useAddCartItemMutation()
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = async () => {
    if (!product) return

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: location } })
      return
    }

    try {
      await addCartItem({ productId: product.id, quantity }).unwrap()
      showNotification({
        type: 'success',
        title: t('addedToCartTitle'),
        message: t('addedToCart', { name: product.name }),
      })
    } catch (err) {
      showNotification({
        type: 'error',
        title: t('errorTitle', { ns: 'common' }),
        message: getApiErrorMessage(err, t('addToCartError')),
      })
    }
  }

  if (isLoading) {
    return (
      <Container size="xl" py="md">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <Skeleton h={460} radius="md" />
          <Stack gap="md">
            <Skeleton h={36} w="70%" radius="sm" />
            <Skeleton h={40} w="40%" radius="sm" />
            <Skeleton h={16} radius="sm" />
            <Skeleton h={16} radius="sm" />
            <Skeleton h={16} w="80%" radius="sm" />
            <Skeleton h={42} w={200} radius="sm" mt="md" />
          </Stack>
        </SimpleGrid>
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
          <Button component={Link} to={ROUTES.CATALOG}>
            {t('backToCatalog')}
          </Button>
        </Container>
      )
    }

    return (
      <Container size="xl" py="md">
        <Alert color="red" title={t('loadError')}>
          {getApiErrorMessage(error, t('unexpectedError', { ns: 'common' }))}
        </Alert>
      </Container>
    )
  }

  if (!product) return null

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <Anchor component={Link} to={ROUTES.CATALOG} size="sm" underline="never">
          <Group gap={4} wrap="nowrap">
            <IconArrowLeft size={14} />
            {t('backToCatalog')}
          </Group>
        </Anchor>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <ProductGallery images={product.images} name={product.name} />

          <Stack gap="md">
            <Title order={1}>{product.name}</Title>

            <Text fz={{ base: 28, sm: 34 }} fw={700} c="black">
              {formatPrice(product.price)}
            </Text>

            <Text
              c={product.description ? undefined : 'dimmed'}
              style={{ whiteSpace: 'pre-line' }}
            >
              {product.description ?? t('noDescription')}
            </Text>

            <Divider />

            <Group align="flex-end" gap="sm" wrap="nowrap">
              <NumberInput
                label={t('quantity', { ns: 'cart' })}
                value={quantity}
                onChange={(value) =>
                  setQuantity(typeof value === 'number' ? value : 1)
                }
                min={1}
                clampBehavior="strict"
                allowDecimal={false}
                w={110}
              />
              <Button
                leftSection={<IconShoppingCartPlus size={18} />}
                loading={isAdding}
                onClick={handleAddToCart}
              >
                {t('addToCart', { ns: 'catalog' })}
              </Button>
            </Group>
          </Stack>
        </SimpleGrid>
      </Stack>
    </Container>
  )
}
