import type { Role } from './role'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  createdAt: string
  updatedAt: string
}
