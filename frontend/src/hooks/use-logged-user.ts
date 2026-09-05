import { useAppSelector } from '@/store'
import { Role } from '@/types/users/role'

export const useLoggedUser = () => {
  const user = useAppSelector((state) => state.auth.user)

  return {
    loggedUser: user,
    isAuthenticated: user !== null,
    isAdmin: user?.role === Role.ADMIN,
  }
}
