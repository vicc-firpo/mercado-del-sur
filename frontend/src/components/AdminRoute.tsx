import { ROUTES } from '@/constants/routes'
import { useLoggedUser } from '@/hooks/use-logged-user'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export function AdminRoute() {
  const { isAuthenticated, isAdmin } = useLoggedUser()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />
  }
  if (!isAdmin) {
    return <Navigate to={ROUTES.CATALOG} replace />
  }
  return <Outlet />
}
