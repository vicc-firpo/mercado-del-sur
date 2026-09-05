import { SiteFooter } from '@/components/site-footer/SiteFooter'
import { StoreTopbar } from '@/components/store-topbar/StoreTopbar'
import { AppShell } from '@mantine/core'
import { Outlet } from 'react-router-dom'

export function StoreLayout() {
  return (
    <AppShell header={{ height: 80 }} padding="md">
      <AppShell.Header>
        <StoreTopbar />
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
        <SiteFooter />
      </AppShell.Main>
    </AppShell>
  )
}
