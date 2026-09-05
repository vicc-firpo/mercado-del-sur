import type { Product } from '@/types/products/product'

export interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}

export interface Cart {
  items: CartItem[]
  total: number
}
