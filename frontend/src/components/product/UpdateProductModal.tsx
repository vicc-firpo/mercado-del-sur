import { getApiErrorMessage } from '@/helpers/get-api-error'
import { showNotification } from '@/helpers/show-notification'
import { useUpdateProductMutation } from '@/store'
import type { Product } from '@/types/products/product'
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core'
import { hasLength, isNotEmpty, useForm } from '@mantine/form'
import { useTranslation } from 'react-i18next'

const NAME_MAX_LENGTH = 255
const DESCRIPTION_MAX_LENGTH = 2000

interface UpdateProductModalProps {
  product: Product | null
  onClose: () => void
}

interface FormValues {
  name: string
  description: string
  price: number | string
}

function EditProductForm({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
  const { t } = useTranslation('admin')
  const [updateProduct, { isLoading }] = useUpdateProductMutation()

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: {
      name: product.name,
      description: product.description ?? '',
      price: product.price,
    },
    validate: {
      name: (value) =>
        isNotEmpty(t('required', { ns: 'validation' }))(value) ??
        hasLength(
          { max: NAME_MAX_LENGTH },
          t('maxLength', { ns: 'validation', count: NAME_MAX_LENGTH }),
        )(value),
      description: (value) =>
        isNotEmpty(t('required', { ns: 'validation' }))(value) ??
        hasLength(
          { max: DESCRIPTION_MAX_LENGTH },
          t('maxLength', { ns: 'validation', count: DESCRIPTION_MAX_LENGTH }),
        )(value),
      price: (value) =>
        typeof value === 'number' && value > 0
          ? null
          : t('positiveNumber', { ns: 'validation' }),
    },
  })

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await updateProduct({
        id: product.id,
        updateProductParams: {
          name: values.name.trim(),
          description: values.description.trim(),
          price: Number(values.price),
        },
      }).unwrap()
      showNotification({
        type: 'success',
        title: t('successTitle', { ns: 'common' }),
        message: t('products.updateSuccess'),
      })
      onClose()
    } catch (err) {
      showNotification({
        type: 'error',
        title: t('errorTitle', { ns: 'common' }),
        message: getApiErrorMessage(err, t('products.form.updateError')),
      })
    }
  })

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label={t('products.form.name')}
          withAsterisk
          maxLength={NAME_MAX_LENGTH}
          key={form.key('name')}
          {...form.getInputProps('name')}
        />

        <Textarea
          label={t('products.form.description')}
          withAsterisk
          autosize
          minRows={3}
          maxRows={8}
          maxLength={DESCRIPTION_MAX_LENGTH}
          key={form.key('description')}
          {...form.getInputProps('description')}
        />

        <NumberInput
          label={t('products.form.price')}
          withAsterisk
          min={0}
          step={100}
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          hideControls
          key={form.key('price')}
          {...form.getInputProps('price')}
        />

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose} disabled={isLoading}>
            {t('cancel', { ns: 'common' })}
          </Button>
          <Button type="submit" variant="light" loading={isLoading}>
            {t('products.form.save')}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}

export function UpdateProductModal({ product, onClose }: UpdateProductModalProps) {
  const { t } = useTranslation('admin')

  return (
    <Modal
      opened={product !== null}
      onClose={onClose}
      title={t('products.editModalTitle')}
      centered
    >
      {product && (
        <EditProductForm key={product.id} product={product} onClose={onClose} />
      )}
    </Modal>
  )
}
