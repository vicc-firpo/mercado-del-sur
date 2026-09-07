import { ProductSearch } from '@/components/product/ProductSearch'
import { ProductGrid } from '@/components/product/ProductGrid'
import { PromoCarousel } from '@/components/marketing/PromoCarousel'
import { TrustHighlights } from '@/components/marketing/TrustHighlights'
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
        <ProductSearch value={search} onChange={setSearch} />

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
