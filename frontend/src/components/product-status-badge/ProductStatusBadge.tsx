import { Badge } from '@mantine/core'
import { useTranslation } from 'react-i18next'

export function ProductStatusBadge({ active }: { active: boolean }) {
  const { t } = useTranslation('products')

  return (
    <Badge color={active ? 'green' : 'yellow'} variant="light">
      {active ? t('active') : t('inactive')}
    </Badge>
  )
}
