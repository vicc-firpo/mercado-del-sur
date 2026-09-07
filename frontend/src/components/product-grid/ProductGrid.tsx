import { ProductCard } from '@/components/product-card/ProductCard'
import type { Product } from '@/types/products/product'
import { SimpleGrid, Skeleton, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'

const GRID_COLS = { base: 1, xs: 2, sm: 3, md: 4 }
const SKELETON_COUNT = 8

export function ProductGrid({
  products,
  loading = false,
  emptyMessage,
}: {
  products: Product[]
  loading?: boolean
  emptyMessage?: string
}) {
  const { t } = useTranslation('catalog')

  if (loading) {
    return (
      <SimpleGrid cols={GRID_COLS} spacing="lg">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <Skeleton key={i} height={320} radius="md" />
        ))}
      </SimpleGrid>
    )
  }

  if (products.length === 0) {
    return <Text c="dimmed">{emptyMessage ?? t('empty')}</Text>
  }

  return (
    <SimpleGrid cols={GRID_COLS} spacing="lg">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </SimpleGrid>
  )
}
