import logoUrl from '@/assets/logo.png'
import { ROUTES } from '@/constants/routes'
import { showNotification } from '@/helpers/show-notification'
import { useLoggedUser } from '@/hooks/use-logged-user'
import { useLogoutMutation } from '@/store'
import { ActionIcon, Button, Group, Image, Menu } from '@mantine/core'
import { IconReceipt, IconShoppingCart, IconUser } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useNavigate } from 'react-router-dom'

export function StoreTopbar() {
  const { t } = useTranslation()
  const { isAuthenticated, isAdmin, loggedUser } = useLoggedUser()
  const [logout] = useLogoutMutation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
      .unwrap()
      .catch(() => undefined)
    navigate(ROUTES.CATALOG)
    showNotification({
      type: 'success',
      title: t('nav.logout'),
      message: t('loggedOut', { ns: 'auth' }),
    })
  }

  return (
    <Group h="100%" px="md" justify="space-between">
      <Link
        to={ROUTES.CATALOG}
        aria-label={t('appName')}
        style={{ display: 'inline-flex', alignItems: 'center' }}
      >
        <Image src={logoUrl} alt={t('appName')} h={54} w="auto" fit="contain" />
      </Link>

      <Group gap="xs">
        {isAuthenticated && (
          <Button
            component={Link}
            to={ROUTES.ORDERS}
            variant="subtle"
            leftSection={<IconReceipt size={16} />}
            visibleFrom="xs"
          >
            {t('nav.orders')}
          </Button>
        )}

        <ActionIcon
          component={NavLink}
          to={ROUTES.CART}
          variant="subtle"
          size="lg"
          aria-label={t('nav.cart')}
        >
          <IconShoppingCart size={20} />
        </ActionIcon>

        {isAuthenticated ? (
          <Menu position="bottom-end" withArrow>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                size="lg"
                aria-label={loggedUser?.firstName ?? t('nav.account')}
              >
                <IconUser size={20} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>
                {loggedUser?.firstName ?? t('nav.account')}
              </Menu.Label>
              <Menu.Item component={Link} to={ROUTES.ORDERS}>
                {t('nav.orders')}
              </Menu.Item>
              {isAdmin && (
                <Menu.Item component={Link} to={ROUTES.ADMIN}>
                  {t('nav.adminPanel')}
                </Menu.Item>
              )}
              <Menu.Divider />
              <Menu.Item color="red" onClick={handleLogout}>
                {t('nav.logout')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Button component={Link} to={ROUTES.LOGIN} variant="light">
            {t('nav.login')}
          </Button>
        )}
      </Group>
    </Group>
  )
}
