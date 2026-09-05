import { PagePlaceholder } from '@/components/PagePlaceholder'
import { useTranslation } from 'react-i18next'

export default function OrdersPage() {
  const { t } = useTranslation('orders')
  return <PagePlaceholder title={t('title')} />
}
