export const ROUTES = {
  CATALOG: '/',
  PRODUCT_DETAIL: '/products/:id',
  LOGIN: '/login',
  REGISTER: '/register',
  CART: '/cart',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  ADMIN: '/admin',
  ADMIN_PRODUCT_DETAIL: '/admin/products/:id',
} as const

export function buildPath(
  template: string,
  params: Record<string, string | number>,
): string {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, String(value)),
    template,
  )
}
