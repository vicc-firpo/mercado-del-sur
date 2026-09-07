import { ChangeImagesModal } from '@/components/change-images-modal/ChangeImagesModal'
import { DeleteProductModal } from '@/components/delete-product-modal/DeleteProductModal'
import { EditProductModal } from '@/components/edit-product-modal/EditProductModal'
import { ProductGallery } from '@/components/product-gallery/ProductGallery'
import { ProductStatusBadge } from '@/components/product-status-badge/ProductStatusBadge'
import { ROUTES } from '@/constants/routes'
import { formatPrice } from '@/helpers/format-price'
import { getApiErrorMessage } from '@/helpers/get-api-error'
import { showNotification } from '@/helpers/show-notification'
import { useGetProductByIdQuery, useSetProductActiveMutation } from '@/store'
import {
  Alert,
  Anchor,
  Button,
  Container,
  Divider,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { skipToken } from '@reduxjs/toolkit/query'
import {
  IconArrowLeft,
  IconPencil,
  IconPhoto,
  IconToggleLeft,
  IconTrash,
} from '@tabler/icons-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'

export default function AdminProductDetailPage() {
  const { t } = useTranslation('admin')
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    data: product,
    isLoading,
    error,
  } = useGetProductByIdQuery(id ?? skipToken)
  const [setProductActive, { isLoading: isTogglingStatus }] =
    useSetProductActiveMutation()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isImagesOpen, setIsImagesOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const handleToggleStatus = async () => {
    if (!product) return

    const nextActive = !product.active
    try {
      await setProductActive({ id: product.id, active: nextActive }).unwrap()
      showNotification({
        type: 'success',
        title: t('successTitle', { ns: 'common' }),
        message: nextActive
          ? t('products.detail.activateSuccess')
          : t('products.detail.deactivateSuccess'),
      })
    } catch (err) {
      showNotification({
        type: 'error',
        title: t('errorTitle', { ns: 'common' }),
        message: getApiErrorMessage(err, t('products.detail.statusError')),
      })
    }
  }

  const backLink = (
    <Anchor
      component={Link}
      to={ROUTES.ADMIN}
      size="sm"
      c="blue"
      underline="never"
    >
      <Group gap={4} wrap="nowrap">
        <IconArrowLeft size={14} />
        {t('products.detail.backToList')}
      </Group>
    </Anchor>
  )

  if (isLoading) {
    return (
      <Container size="lg" py="md">
        <Stack gap="lg">
          {backLink}
          <Skeleton h={32} w="50%" radius="sm" />
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Skeleton h={360} radius="md" />
            <Stack gap="md">
              <Skeleton h={16} radius="sm" />
              <Skeleton h={16} radius="sm" />
              <Skeleton h={16} w="70%" radius="sm" />
            </Stack>
          </SimpleGrid>
        </Stack>
      </Container>
    )
  }

  if (error) {
    const isNotFound = 'status' in error && error.status === 404

    return (
      <Container size="lg" py="md">
        <Stack gap="lg">
          {backLink}
          {isNotFound ? (
            <div>
              <Title order={2}>{t('products.detail.notFoundTitle')}</Title>
              <Text c="dimmed" mt="xs">
                {t('products.detail.notFoundText')}
              </Text>
            </div>
          ) : (
            <Alert color="red" title={t('products.detail.loadError')}>
              {getApiErrorMessage(
                error,
                t('unexpectedError', { ns: 'common' }),
              )}
            </Alert>
          )}
        </Stack>
      </Container>
    )
  }

  if (!product) return null

  return (
    <Container size="lg" py="md">
      <Stack gap="lg">
        {backLink}

        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div>
            <Title order={2}>{product.name}</Title>
            <Text size="sm" c="dimmed">
              {t('products.detail.id')}:{' '}
              <Text span ff="monospace">
                {product.id}
              </Text>
            </Text>
          </div>
          <ProductStatusBadge active={product.active} />
        </Group>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <ProductGallery images={product.images} name={product.name} />

          <Stack gap="md">
            <div>
              <Text fw={600} size="sm" c="dimmed">
                {t('price', { ns: 'products' })}
              </Text>
              <Text>{formatPrice(product.price)}</Text>
            </div>

            <div>
              <Text fw={600} size="sm" c="dimmed">
                {t('description', { ns: 'products' })}
              </Text>
              <Text
                c={product.description ? undefined : 'dimmed'}
                style={{ whiteSpace: 'pre-line' }}
              >
                {product.description ?? t('products.detail.noDescription')}
              </Text>
            </div>

            <div>
              <Text fw={600} size="sm" c="dimmed">
                {t('images', { ns: 'products' })}
              </Text>
              <Text>{product.images.length}</Text>
            </div>
          </Stack>
        </SimpleGrid>

        <Divider />

        <Group gap="sm" wrap="wrap">
          <Button
            leftSection={<IconPencil size={16} />}
            onClick={() => setIsEditOpen(true)}
          >
            {t('products.detail.edit')}
          </Button>
          <Button
            variant="default"
            leftSection={<IconPhoto size={16} />}
            onClick={() => setIsImagesOpen(true)}
          >
            {t('products.detail.changeImages')}
          </Button>
          <Button
            variant="light"
            leftSection={<IconToggleLeft size={16} />}
            loading={isTogglingStatus}
            onClick={handleToggleStatus}
          >
            {product.active
              ? t('products.detail.deactivate')
              : t('products.detail.activate')}
          </Button>
          <Button
            color="red"
            variant="light"
            leftSection={<IconTrash size={16} />}
            onClick={() => setIsDeleteOpen(true)}
          >
            {t('products.detail.delete')}
          </Button>
        </Group>
      </Stack>

      <EditProductModal
        product={isEditOpen ? product : null}
        onClose={() => setIsEditOpen(false)}
      />

      <ChangeImagesModal
        product={isImagesOpen ? product : null}
        onClose={() => setIsImagesOpen(false)}
      />

      <DeleteProductModal
        product={isDeleteOpen ? product : null}
        onClose={() => setIsDeleteOpen(false)}
        onDeleted={() => navigate(ROUTES.ADMIN)}
      />
    </Container>
  )
}
