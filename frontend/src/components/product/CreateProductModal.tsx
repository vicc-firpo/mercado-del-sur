import { getApiErrorMessage } from '@/helpers/get-api-error'
import { showNotification } from '@/helpers/show-notification'
import { useCreateProductMutation } from '@/store'
import type { Product } from '@/types/products/product'
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Switch,
  Textarea,
  TextInput,
} from '@mantine/core'
import { hasLength, isNotEmpty, useForm } from '@mantine/form'
import { useTranslation } from 'react-i18next'

const NAME_MAX_LENGTH = 255
const DESCRIPTION_MAX_LENGTH = 2000

interface CreateProductModalProps {
  opened: boolean
  onClose: () => void
  onCreated?: (product: Product) => void
}

interface FormValues {
  name: string
  description: string
  price: number | string
  active: boolean
}

export function CreateProductModal({
  opened,
  onClose,
  onCreated,
}: CreateProductModalProps) {
  const { t } = useTranslation('admin')
  const [createProduct, { isLoading }] = useCreateProductMutation()

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: { name: '', description: '', price: '', active: true },
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

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      const product = await createProduct({
        name: values.name.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        active: values.active,
      }).unwrap()
      showNotification({
        type: 'success',
        title: t('successTitle', { ns: 'common' }),
        message: t('products.createSuccess'),
      })
      handleClose()
      onCreated?.(product)
    } catch (err) {
      showNotification({
        type: 'error',
        title: t('errorTitle', { ns: 'common' }),
        message: getApiErrorMessage(err, t('products.form.createError')),
      })
    }
  })

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t('products.createModalTitle')}
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label={t('products.form.name')}
            placeholder={t('products.form.namePlaceholder')}
            withAsterisk
            maxLength={NAME_MAX_LENGTH}
            key={form.key('name')}
            {...form.getInputProps('name')}
          />

          <Textarea
            label={t('products.form.description')}
            placeholder={t('products.form.descriptionPlaceholder')}
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

          <Switch
            label={t('products.form.active')}
            description={t('products.form.activeHint')}
            key={form.key('active')}
            {...form.getInputProps('active', { type: 'checkbox' })}
          />

          <Group justify="flex-end" mt="sm">
            <Button
              variant="default"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t('cancel', { ns: 'common' })}
            </Button>
            <Button type="submit" loading={isLoading}>
              {t('products.form.submit')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
