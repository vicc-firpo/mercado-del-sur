import { PagePlaceholder } from '@/components/PagePlaceholder'
import { useTranslation } from 'react-i18next'

export default function RegisterPage() {
  const { t } = useTranslation('auth')
  return <PagePlaceholder title={t('register')} />
}
