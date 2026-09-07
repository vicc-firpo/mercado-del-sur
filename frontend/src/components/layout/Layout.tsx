import { Footer } from '@/components/layout/Footer'
import { Topbar } from '@/components/layout/Topbar'
import { AppShell } from '@mantine/core'
import { Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <AppShell
      header={{ height: { base: 64, xs: 100 } }}
      padding="md"
      styles={{ main: { display: 'flex', flexDirection: 'column' } }}
    >
      <AppShell.Header>
        <Topbar />
      </AppShell.Header>

      <AppShell.Main>
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
        <Footer />
      </AppShell.Main>
    </AppShell>
  )
}
