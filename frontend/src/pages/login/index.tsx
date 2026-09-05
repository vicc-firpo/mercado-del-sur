import { PagePlaceholder } from '@/components/PagePlaceholder'
import { useTranslation } from 'react-i18next'

export default function LoginPage() {
  const { t } = useTranslation('auth')
  return <PagePlaceholder title={t('logIn')} />
}
