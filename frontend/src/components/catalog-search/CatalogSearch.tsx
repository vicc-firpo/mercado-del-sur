import { TextInput } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'

interface CatalogSearchProps {
  value: string
  onChange: (value: string) => void
}

export function CatalogSearch({ value, onChange }: CatalogSearchProps) {
  const { t } = useTranslation('catalog')

  return (
    <TextInput
      size="md"
      radius="md"
      leftSection={<IconSearch size={18} />}
      placeholder={t('searchPlaceholder')}
      aria-label={t('searchPlaceholder')}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  )
}
