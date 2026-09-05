import { ROUTES } from '@/constants/routes'
import { useLoggedUser } from '@/hooks/use-logged-user'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export function ProtectedRoute() {
  const { isAuthenticated } = useLoggedUser()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />
  }
  return <Outlet />
}
