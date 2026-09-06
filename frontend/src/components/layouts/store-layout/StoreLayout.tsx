import { SiteFooter } from '@/components/site-footer/SiteFooter'
import { StoreTopbar } from '@/components/store-topbar/StoreTopbar'
import { AppShell } from '@mantine/core'
import { Outlet } from 'react-router-dom'

export function StoreLayout() {
  return (
    <AppShell
      header={{ height: 80 }}
      padding="md"
      styles={{ main: { display: 'flex', flexDirection: 'column' } }}
    >
      <AppShell.Header>
        <StoreTopbar />
      </AppShell.Header>

      <AppShell.Main>
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
        <SiteFooter />
      </AppShell.Main>
    </AppShell>
  )
}
