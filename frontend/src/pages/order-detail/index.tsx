import { PagePlaceholder } from '@/components/PagePlaceholder'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

export default function OrderDetailPage() {
  const { t } = useTranslation('orders')
  const { id } = useParams()

  return (
    <PagePlaceholder title={t('detailTitle')}>
      {t('detailPending', { id })}
    </PagePlaceholder>
  )
}
