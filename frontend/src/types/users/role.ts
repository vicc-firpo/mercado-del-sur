export const Role = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
} as const

export type Role = (typeof Role)[keyof typeof Role]
