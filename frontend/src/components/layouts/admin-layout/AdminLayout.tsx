import { ROUTES } from '@/constants/routes'
import { AppShell, Group, NavLink as MantineNavLink, Text } from '@mantine/core'
import { IconBox, IconUsers } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { to: ROUTES.ADMIN_PRODUCTS, labelKey: 'nav.products', icon: IconBox },
  { to: ROUTES.ADMIN_USERS, labelKey: 'nav.users', icon: IconUsers },
] as const

export function AdminLayout() {
  const { t } = useTranslation('admin')

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 240, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Text fw={700} size="lg" c="primary">
            {t('panelTitle')}
          </Text>
          <Text component={Link} to={ROUTES.CATALOG} size="sm" c="dimmed">
            ← {t('backToStore', { ns: 'common' })}
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        {NAV_ITEMS.map(({ to, labelKey, icon: Icon }) => (
          <MantineNavLink
            key={to}
            component={NavLink}
            to={to}
            label={t(labelKey)}
            leftSection={<Icon size={18} />}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
