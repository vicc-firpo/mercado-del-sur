import { CatalogSearch } from '@/components/catalog-search/CatalogSearch'
import { ProductGrid } from '@/components/product-grid/ProductGrid'
import { PromoCarousel } from '@/components/promo-carousel/PromoCarousel'
import { TrustHighlights } from '@/components/trust-highlights/TrustHighlights'
import { getApiErrorMessage } from '@/helpers/get-api-error'
import { useGetProductsQuery } from '@/store'
import { Alert, Container, Stack, Title } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function CatalogPage() {
  const { t } = useTranslation('catalog')

  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 300)
  const trimmedSearch = debouncedSearch.trim()

  const { data, isLoading, error } = useGetProductsQuery(
    trimmedSearch ? { search: trimmedSearch } : undefined,
  )
  const products = data ?? []

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        <PromoCarousel />
        <CatalogSearch value={search} onChange={setSearch} />

        <Stack gap="lg">
          <Title order={2}>{t('sectionTitle')}</Title>

          {error ? (
            <Alert color="red" title={t('loadError')}>
              {getApiErrorMessage(error, t('unexpectedError', { ns: 'common' }))}
            </Alert>
          ) : (
            <ProductGrid
              products={products}
              loading={isLoading}
              emptyMessage={
                trimmedSearch
                  ? t('noResults', { query: trimmedSearch })
                  : undefined
              }
            />
          )}
        </Stack>

        <TrustHighlights />
      </Stack>
    </Container>
  )
}
