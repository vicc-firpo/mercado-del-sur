import { getApiErrorMessage } from '@/helpers/get-api-error'
import { productImageUrl } from '@/helpers/product-image-url'
import { showNotification } from '@/helpers/show-notification'
import {
  useDeleteProductImageMutation,
  useUploadProductImageMutation,
} from '@/store'
import type { Product } from '@/types/products/product'
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Image,
  Modal,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core'
import { Dropzone } from '@mantine/dropzone'
import { IconPhoto, IconTrash, IconUpload, IconX } from '@tabler/icons-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

interface ChangeImagesModalProps {
  product: Product | null
  onClose: () => void
}

function ChangeImagesModalBody({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
  const { t } = useTranslation('admin')
  const [uploadImage, { isLoading: isUploading }] =
    useUploadProductImageMutation()
  const [deleteImage] = useDeleteProductImageMutation()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDrop = async (files: File[]) => {
    for (const file of files) {
      try {
        await uploadImage({ productId: product.id, file }).unwrap()
        showNotification({
          type: 'success',
          title: t('successTitle', { ns: 'common' }),
          message: t('products.images.uploadSuccess'),
        })
      } catch (err) {
        showNotification({
          type: 'error',
          title: t('errorTitle', { ns: 'common' }),
          message: getApiErrorMessage(err, t('products.images.uploadError')),
        })
      }
    }
  }

  const handleDelete = async (imageId: string) => {
    setDeletingId(imageId)
    try {
      await deleteImage({ productId: product.id, imageId }).unwrap()
      showNotification({
        type: 'success',
        title: t('successTitle', { ns: 'common' }),
        message: t('products.images.deleteSuccess'),
      })
    } catch (err) {
      showNotification({
        type: 'error',
        title: t('errorTitle', { ns: 'common' }),
        message: getApiErrorMessage(err, t('products.images.deleteError')),
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Stack gap="md">
      <div>
        <Text fw={600} size="sm" mb="xs">
          {t('products.images.current')}
        </Text>
        {product.images.length === 0 ? (
          <Text c="dimmed" size="sm">
            {t('products.images.empty')}
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 3, xs: 4 }} spacing="xs">
            {product.images.map((image) => (
              <Box key={image.id} pos="relative">
                <Image
                  src={productImageUrl(image)}
                  h={90}
                  fit="cover"
                  radius="sm"
                  alt={product.name}
                />
                <ActionIcon
                  color="red"
                  variant="filled"
                  size="sm"
                  pos="absolute"
                  top={4}
                  right={4}
                  aria-label={t('products.images.deleteImage')}
                  loading={deletingId === image.id}
                  onClick={() => handleDelete(image.id)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </div>

      <Dropzone
        onDrop={handleDrop}
        accept={ACCEPTED_MIME_TYPES}
        maxSize={MAX_IMAGE_SIZE_BYTES}
        loading={isUploading}
      >
        <Group
          justify="center"
          gap="md"
          mih={120}
          style={{ pointerEvents: 'none' }}
        >
          <Dropzone.Accept>
            <IconUpload size={40} stroke={1.4} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={40} stroke={1.4} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto size={40} stroke={1.4} />
          </Dropzone.Idle>
          <div>
            <Text size="sm">{t('products.images.dropzoneTitle')}</Text>
            <Text size="xs" c="dimmed" mt={4}>
              {t('products.images.dropzoneHint')}
            </Text>
          </div>
        </Group>
      </Dropzone>

      <Group justify="flex-end">
        <Button variant="light" onClick={onClose}>
          {t('products.images.done')}
        </Button>
      </Group>
    </Stack>
  )
}

export function ChangeImagesModal({
  product,
  onClose,
}: ChangeImagesModalProps) {
  const { t } = useTranslation('admin')

  return (
    <Modal
      opened={product !== null}
      onClose={onClose}
      title={t('products.images.modalTitle', { name: product?.name ?? '' })}
      centered
      size="lg"
    >
      {product && <ChangeImagesModalBody product={product} onClose={onClose} />}
    </Modal>
  )
}
