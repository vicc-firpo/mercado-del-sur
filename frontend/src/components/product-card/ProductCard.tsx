import { ProductThumbnail } from '@/components/product-card/ProductThumbnail'
import { buildPath, ROUTES } from '@/constants/routes'
import { formatPrice } from '@/helpers/format-price'
import type { Product } from '@/types/products/product'
import { Anchor, Card, Divider, Group, Stack, Text } from '@mantine/core'
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
        <Text fw={600} c="black" lineClamp={1}>
          {product.name}
        </Text>

        <Text
          size="sm"
          c="dimmed"
          lineClamp={2}
          mb="md"
          style={{ minHeight: DESCRIPTION_MIN_HEIGHT }}
        >
          {product.description ?? ''}
        </Text>

        <Divider mt="auto" />

        <Group justify="space-between" align="flex-end" pt="sm" wrap="nowrap">
          <Stack gap={0}>
            <Text size="xs" c="dimmed">
              {t('workshopPrice')}
            </Text>
            <Text fw={700}>{formatPrice(product.price)}</Text>
          </Stack>
          <Anchor
            component={Link}
            to={detailPath}
            size="sm"
            c="blue"
            underline="never"
          >
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
