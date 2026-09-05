export const ProductStatusFilter = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ALL: 'all',
} as const

export type ProductStatusFilter =
  (typeof ProductStatusFilter)[keyof typeof ProductStatusFilter]
