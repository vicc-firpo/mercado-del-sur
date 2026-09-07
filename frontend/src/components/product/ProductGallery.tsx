import { productImageUrl } from '@/helpers/product-image-url'
import type { ProductImage } from '@/types/products/product-image'
import { Center, Image, SimpleGrid, Stack } from '@mantine/core'
import { IconPhoto } from '@tabler/icons-react'
import { useState } from 'react'

export function ProductGallery({
  images,
  name,
}: {
  images: ProductImage[]
  name: string
}) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <Center
        h={{ base: 320, sm: 460 }}
        bg="gray.1"
        c="gray.5"
        style={{ borderRadius: 'var(--mantine-radius-md)' }}
      >
        <IconPhoto size={64} stroke={1.2} />
      </Center>
    )
  }

  const current = images[Math.min(active, images.length - 1)]

  return (
    <Stack gap="sm">
      <Image
        src={productImageUrl(current)}
        h={{ base: 320, sm: 460 }}
        fit="contain"
        radius="md"
        alt={name}
      />

      {images.length > 1 && (
        <SimpleGrid cols={{ base: 4, xs: 5 }} spacing="xs">
          {images.map((image, index) => (
            <Image
              key={image.id}
              src={productImageUrl(image)}
              h={72}
              fit="cover"
              radius="sm"
              alt={name}
              role="button"
              tabIndex={0}
              onClick={() => setActive(index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setActive(index)
                }
              }}
              style={{
                cursor: 'pointer',
                border:
                  index === active
                    ? '2px solid var(--mantine-color-primary-6)'
                    : '2px solid transparent',
              }}
            />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  )
}
