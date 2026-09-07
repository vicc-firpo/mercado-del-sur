import { CreateProductModal } from '@/components/product/CreateProductModal'
import { DeleteProductModal } from '@/components/product/DeleteProductModal'
import { UpdateProductModal } from '@/components/product/UpdateProductModal'
import { ProductStatusBadge } from '@/components/product/ProductStatusBadge'
import { buildPath, ROUTES } from '@/constants/routes'
import { getApiErrorMessage } from '@/helpers/get-api-error'
import { useGetProductsQuery } from '@/store'
import type { Product } from '@/types/products/product'
import { ProductStatusFilter } from '@/types/products/product-status-filter'
import {
  ActionIcon,
  Alert,
  Button,
  Container,
  Group,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import {
  IconEye,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export default function AdminProductsPage() {
  const { t } = useTranslation('admin')
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 300)
  const trimmedSearch = debouncedSearch.trim()

  const { data, isLoading, error } = useGetProductsQuery({
    status: ProductStatusFilter.ALL,
    search: trimmedSearch || undefined,
  })

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const products = data ?? []

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <Title order={2}>{t('products.title')}</Title>

        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <TextInput
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            placeholder={t('products.searchPlaceholder')}
            aria-label={t('products.searchLabel')}
            w={{ base: '100%', sm: 360 }}
          />
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={() => setIsCreateOpen(true)}
          >
            {t('products.new')}
          </Button>
        </Group>

        {error ? (
          <Alert color="red" title={t('products.loadError')}>
            {getApiErrorMessage(error, t('unexpectedError', { ns: 'common' }))}
          </Alert>
        ) : isLoading ? (
          <Stack gap="xs">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} h={48} radius="sm" />
            ))}
          </Stack>
        ) : products.length === 0 ? (
          <Text c="dimmed" py="xl" ta="center">
            {trimmedSearch
              ? t('products.noResults', { query: trimmedSearch })
              : t('products.empty')}
          </Text>
        ) : (
          <Table.ScrollContainer minWidth={640}>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={120}>{t('products.columns.id')}</Table.Th>
                  <Table.Th>{t('products.columns.name')}</Table.Th>
                  <Table.Th w={120}>{t('products.columns.status')}</Table.Th>
                  <Table.Th w={140} ta="right">
                    {t('products.columns.actions')}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {products.map((product) => {
                  const detailPath = buildPath(ROUTES.ADMIN_PRODUCT_DETAIL, {
                    id: product.id,
                  })

                  return (
                    <Table.Tr key={product.id}>
                      <Table.Td>
                        <Text ff="monospace" size="sm" c="dimmed">
                          {product.id.slice(0, 8)}
                        </Text>
                      </Table.Td>
                      <Table.Td>{product.name}</Table.Td>
                      <Table.Td>
                        <ProductStatusBadge active={product.active} />
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4} justify="flex-end" wrap="nowrap">
                          <Tooltip label={t('products.rowActions.view')}>
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              aria-label={t('products.rowActions.view')}
                              onClick={() => navigate(detailPath)}
                            >
                              <IconEye size={18} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={t('products.rowActions.edit')}>
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              aria-label={t('products.rowActions.edit')}
                              onClick={() => setEditTarget(product)}
                            >
                              <IconPencil size={18} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={t('products.rowActions.delete')}>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              aria-label={t('products.rowActions.delete')}
                              onClick={() => setDeleteTarget(product)}
                            >
                              <IconTrash size={18} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  )
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Stack>

      <CreateProductModal
        opened={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(product) =>
          navigate(buildPath(ROUTES.ADMIN_PRODUCT_DETAIL, { id: product.id }))
        }
      />

      <UpdateProductModal
        product={editTarget}
        onClose={() => setEditTarget(null)}
      />

      <DeleteProductModal
        product={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </Container>
  )
}
