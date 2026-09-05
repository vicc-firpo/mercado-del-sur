export type ImageExtension = 'jpg' | 'png' | 'webp'

export interface ProductImage {
  id: string
  extension: ImageExtension
  url: string
  productId: string
  createdAt: string
  updatedAt: string
}
