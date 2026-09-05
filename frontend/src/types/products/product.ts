import type { ProductImage } from './product-image'

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  active: boolean
  images: ProductImage[]
  createdAt: string
  updatedAt: string
}
