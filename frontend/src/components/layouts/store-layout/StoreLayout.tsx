import { ROUTES } from '@/constants/routes'
import { useLoggedUser } from '@/hooks/use-logged-user'
import { useLogoutMutation } from '@/store'
import { ActionIcon, AppShell, Button, Group, Menu, Text } from '@mantine/core'
import { IconShoppingCart, IconUser } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'

export function StoreLayout() {
  const { t } = useTranslation()
  const { isAuthenticated, isAdmin, loggedUser } = useLoggedUser()
  const [logout] = useLogoutMutation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
      .unwrap()
      .catch(() => undefined)
    navigate(ROUTES.CATALOG)
  }

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Text
            component={Link}
            to={ROUTES.CATALOG}
            fw={700}
            size="lg"
            c="primary"
            style={{ textDecoration: 'none' }}
          >
            {t('appName')}
          </Text>

          <Group gap="xs">
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
                  <Button variant="subtle" leftSection={<IconUser size={16} />}>
                    {loggedUser?.firstName ?? t('nav.account')}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
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
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
