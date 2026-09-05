import { PagePlaceholder } from '@/components/PagePlaceholder'
import { useTranslation } from 'react-i18next'

export default function AdminProductsPage() {
  const { t } = useTranslation('admin')
  return <PagePlaceholder title={t('products.title')} />
}
