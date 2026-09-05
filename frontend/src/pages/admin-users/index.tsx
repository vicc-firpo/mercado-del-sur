import { PagePlaceholder } from '@/components/PagePlaceholder'
import { useTranslation } from 'react-i18next'

export default function AdminUsersPage() {
  const { t } = useTranslation('admin')
  return <PagePlaceholder title={t('users.title')} />
}
