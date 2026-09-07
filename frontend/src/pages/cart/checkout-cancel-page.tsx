import { ROUTES } from '@/constants/routes'
import { clearPendingOrderId } from '@/lib/pending-order'
import {
  Button,
  Center,
  Container,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { IconShoppingCartX } from '@tabler/icons-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function CheckoutCancelPage() {
  const { t } = useTranslation('checkout')

  useEffect(() => {
    // El usuario abandonó el pago; la orden queda pendiente sin cargo.
    clearPendingOrderId()
  }, [])

  return (
    <Container size="sm" py={80}>
      <Center>
        <Stack align="center" gap="md">
          <ThemeIcon size={64} radius="xl" variant="light" color="gray">
            <IconShoppingCartX size={40} />
          </ThemeIcon>
          <Title order={2} ta="center">
            {t('cancelledTitle')}
          </Title>
          <Text c="dimmed" ta="center" maw={420}>
            {t('cancelledText')}
          </Text>
          <Group mt="sm">
            <Button component={Link} to={ROUTES.CART}>
              {t('backToCart')}
            </Button>
            <Button component={Link} to={ROUTES.CATALOG} variant="light">
              {t('browseCatalog')}
            </Button>
          </Group>
        </Stack>
      </Center>
    </Container>
  )
}
