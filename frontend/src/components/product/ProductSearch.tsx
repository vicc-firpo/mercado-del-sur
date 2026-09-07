import { TextInput, type TextInputProps } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'

interface ProductSearchProps extends Omit<TextInputProps, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
}

export function ProductSearch({ value, onChange, ...props }: ProductSearchProps) {
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
      {...props}
    />
  )
}
