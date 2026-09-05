import { ROUTES } from '@/constants/routes'
import { Button, Container, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <Container size="sm" py="xl" ta="center">
      <Title order={1}>404</Title>
      <Text c="dimmed" my="md">
        {t('notFoundText')}
      </Text>
      <Button component={Link} to={ROUTES.CATALOG}>
        {t('goHome')}
      </Button>
    </Container>
  )
}
