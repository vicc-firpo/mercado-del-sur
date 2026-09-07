import { getApiErrorMessage } from '@/helpers/get-api-error'
import { showNotification } from '@/helpers/show-notification'
import { useDeleteProductMutation } from '@/store'
import type { Product } from '@/types/products/product'
import { Button, Group, Modal, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'

interface DeleteProductModalProps {
  product: Product | null
  onClose: () => void
  onDeleted?: () => void
}

export function DeleteProductModal({
  product,
  onClose,
  onDeleted,
}: DeleteProductModalProps) {
  const { t } = useTranslation('admin')
  const [deleteProduct, { isLoading }] = useDeleteProductMutation()

  const handleDelete = async () => {
    if (!product) return

    try {
      await deleteProduct(product.id).unwrap()
      showNotification({
        type: 'success',
        title: t('successTitle', { ns: 'common' }),
        message: t('products.deleteSuccess'),
      })
      onClose()
      onDeleted?.()
    } catch (err) {
      showNotification({
        type: 'error',
        title: t('errorTitle', { ns: 'common' }),
        message: getApiErrorMessage(err, t('products.deleteError')),
      })
    }
  }

  return (
    <Modal
      opened={product !== null}
      onClose={onClose}
      title={t('products.deleteConfirmTitle')}
      centered
    >
      <Text size="sm">
        {t('products.deleteConfirmText', { name: product?.name ?? '' })}
      </Text>

      <Group justify="flex-end" mt="lg">
        <Button variant="default" onClick={onClose} disabled={isLoading}>
          {t('cancel', { ns: 'common' })}
        </Button>
        <Button color="red" loading={isLoading} onClick={handleDelete}>
          {t('delete', { ns: 'common' })}
        </Button>
      </Group>
    </Modal>
  )
}
