import { ProductThumbnail } from '@/components/product-card/ProductThumbnail'
import { buildPath, ROUTES } from '@/constants/routes'
import { formatPrice } from '@/helpers/format-price'
import type { Product } from '@/types/products/product'
import { Anchor, Card, Group, Stack, Text } from '@mantine/core'
import { IconArrowRight } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const DESCRIPTION_MIN_HEIGHT = 'calc(1.55em * 2)'

export function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation('catalog')
  const detailPath = buildPath(ROUTES.PRODUCT_DETAIL, { id: product.id })

  return (
    <Card
      withBorder
      radius="md"
      padding="md"
      h="100%"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <Card.Section>
        <ProductThumbnail product={product} />
      </Card.Section>

      <Stack gap={4} mt="md" style={{ flex: 1 }}>
        <Text
          component={Link}
          to={detailPath}
          fw={600}
          c="black"
          lineClamp={1}
          style={{ textDecoration: 'none' }}
        >
          {product.name}
        </Text>

        <Text
          size="sm"
          c="dimmed"
          lineClamp={2}
          style={{ minHeight: DESCRIPTION_MIN_HEIGHT }}
        >
          {product.description ?? ''}
        </Text>

        <Group
          justify="space-between"
          align="center"
          mt="auto"
          pt="sm"
          wrap="nowrap"
        >
          <Text fw={700}>{formatPrice(product.price)}</Text>
          <Anchor component={Link} to={detailPath} size="sm" underline="never">
            <Group gap={4} wrap="nowrap">
              {t('viewDetail')}
              <IconArrowRight size={14} />
            </Group>
          </Anchor>
        </Group>
      </Stack>
    </Card>
  )
}
