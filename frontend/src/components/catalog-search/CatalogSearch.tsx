import { TextInput } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'

export function CatalogSearch() {
  const { t } = useTranslation('catalog')

  return (
    <TextInput
      size="md"
      radius="md"
      leftSection={<IconSearch size={18} />}
      placeholder={t('searchPlaceholder')}
      aria-label={t('searchPlaceholder')}
    />
  )
}
