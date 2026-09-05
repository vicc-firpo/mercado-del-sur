import { PagePlaceholder } from '@/components/PagePlaceholder'
import { useTranslation } from 'react-i18next'

export default function CartPage() {
  const { t } = useTranslation('cart')
  return <PagePlaceholder title={t('title')} />
}
