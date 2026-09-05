import { getApiErrorMessage } from '@/helpers/get-api-error'
import { useGetProductsQuery } from '@/store'
import { Alert, Container, List, Loader, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'

export default function CatalogPage() {
  const { t } = useTranslation('catalog')
  const { data, isLoading, error } = useGetProductsQuery()

  return (
    <Container size="lg" py="md">
      <Title order={2} mb="sm">
        {t('title')}
      </Title>

      {isLoading && <Loader />}
      {error && (
        <Alert color="red" title={t('loadError')}>
          {getApiErrorMessage(error, t('unexpectedError', { ns: 'common' }))}
        </Alert>
      )}
      {data && (
        <>
          <Text c="dimmed" mb="xs">
            {t('productCount', { count: data.length })}
          </Text>
          <List>
            {data.map((product) => (
              <List.Item key={product.id}>
                {product.name} — ${product.price}
              </List.Item>
            ))}
          </List>
        </>
      )}
    </Container>
  )
}
