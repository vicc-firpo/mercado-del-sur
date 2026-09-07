import { firstImageUrl } from '@/helpers/product-image-url'
import type { Product } from '@/types/products/product'
import { Center, Image } from '@mantine/core'
import { IconPhoto } from '@tabler/icons-react'

export function ProductThumbnail({
  product,
  height = 200,
}: {
  product: Product
  height?: number | string
}) {
  const url = firstImageUrl(product)

  if (!url) {
    return (
      <Center h={height} bg="gray.1" c="gray.5">
        <IconPhoto size={48} stroke={1.2} />
      </Center>
    )
  }

  return <Image src={url} h={height} w="100%" alt={product.name} fit="cover" />
}
