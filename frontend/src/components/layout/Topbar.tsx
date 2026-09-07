import logoUrl from '@/assets/logo.png'
import { ROUTES } from '@/constants/routes'
import { useLoggedUser } from '@/hooks/use-logged-user'
import { useLogoutMutation } from '@/store'
import {
  ActionIcon,
  Button,
  Divider,
  Flex,
  Group,
  Image,
  Menu,
} from '@mantine/core'
import {
  IconBuildingStore,
  IconLayoutDashboard,
  IconReceipt,
  IconShoppingCart,
  IconUser,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

export function Topbar() {
  const { t } = useTranslation()
  const { isAuthenticated, isAdmin, loggedUser } = useLoggedUser()
  const [logout] = useLogoutMutation()
  const navigate = useNavigate()
  const location = useLocation()
  const isInAdminPanel = location.pathname.startsWith(ROUTES.ADMIN)

  const handleLogout = async () => {
    await logout()
      .unwrap()
      .catch(() => undefined)
    navigate(ROUTES.CATALOG)
  }

  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Link
        to={ROUTES.CATALOG}
        aria-label={t('appName')}
        style={{ display: 'inline-flex', alignItems: 'center', minWidth: 0 }}
      >
        <Image
          src={logoUrl}
          alt={t('appName')}
          h={{ base: 44, xs: 92 }}
          w="auto"
          fit="contain"
        />
      </Link>

      <Flex
        align="center"
        gap={{ base: 4, xs: 'xs' }}
        wrap="nowrap"
        style={{ flexShrink: 0 }}
      >
        {isAuthenticated && isAdmin && (
          <>
            <Button
              component={Link}
              to={isInAdminPanel ? ROUTES.CATALOG : ROUTES.ADMIN}
              variant="subtle"
              leftSection={
                isInAdminPanel ? (
                  <IconBuildingStore size={16} />
                ) : (
                  <IconLayoutDashboard size={16} />
                )
              }
              visibleFrom="xs"
            >
              {isInAdminPanel ? t('nav.store') : t('nav.adminPanel')}
            </Button>
            <ActionIcon
              component={Link}
              to={isInAdminPanel ? ROUTES.CATALOG : ROUTES.ADMIN}
              variant="subtle"
              size="lg"
              aria-label={isInAdminPanel ? t('nav.store') : t('nav.adminPanel')}
              hiddenFrom="xs"
            >
              {isInAdminPanel ? (
                <IconBuildingStore size={20} />
              ) : (
                <IconLayoutDashboard size={20} />
              )}
            </ActionIcon>
            <Divider orientation="vertical" my={8} visibleFrom="xs" />
          </>
        )}

        {isAuthenticated && !isAdmin && (
          <>
            <Button
              component={Link}
              to={ROUTES.ORDERS}
              variant="subtle"
              leftSection={<IconReceipt size={16} />}
              visibleFrom="xs"
            >
              {t('nav.orders')}
            </Button>
            <ActionIcon
              component={NavLink}
              to={ROUTES.ORDERS}
              variant="subtle"
              size="lg"
              aria-label={t('nav.orders')}
              hiddenFrom="xs"
            >
              <IconReceipt size={20} />
            </ActionIcon>
            <Divider orientation="vertical" my={8} visibleFrom="xs" />
          </>
        )}

        {isAuthenticated && !isAdmin && (
          <ActionIcon
            component={NavLink}
            to={ROUTES.CART}
            variant="subtle"
            size="lg"
            aria-label={t('nav.cart')}
          >
            <IconShoppingCart size={20} />
          </ActionIcon>
        )}

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
      </Flex>
    </Group>
  )
}
