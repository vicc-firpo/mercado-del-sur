import type { User } from '@/types/users/user'

export type { User }

export interface AuthResponse {
  accessToken: string
  user: User
}
