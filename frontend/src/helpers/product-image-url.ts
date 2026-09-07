import type { Product } from '@/types/products/product'
import type { ProductImage } from '@/types/products/product-image'

const API_URL = import.meta.env.VITE_API_URL

export const productImageUrl = (image: ProductImage): string =>
  `${API_URL}${image.url}`

export const firstImageUrl = (product: Product): string | null =>
  product.images.length > 0 ? productImageUrl(product.images[0]) : null
