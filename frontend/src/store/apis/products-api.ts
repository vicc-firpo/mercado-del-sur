import type { CreateProductParams } from '@/types/products/create-product-params'
import type { FindProductsParams } from '@/types/products/find-products-params'
import type { Product } from '@/types/products/product'
import type { ProductImage } from '@/types/products/product-image'
import type { UpdateProductParams } from '@/types/products/update-product-params'
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './base-query'

const TAG_TYPES = ['RETRIEVED_PRODUCTS', 'RETRIEVED_PRODUCT'] as const

export const productsApi = createApi({
  reducerPath: 'productsApi',
  tagTypes: TAG_TYPES,
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], FindProductsParams | void>({
      query: (findProductsParams) => ({
        url: '/products',
        method: 'GET',
        params: findProductsParams ?? undefined,
      }),
      providesTags: ['RETRIEVED_PRODUCTS'],
    }),

    getProductById: builder.query<Product, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'GET',
      }),
      providesTags: (product) => [
        { type: 'RETRIEVED_PRODUCT', id: product?.id },
      ],
    }),

    createProduct: builder.mutation<Product, CreateProductParams>({
      query: (createProductParams) => ({
        url: '/products',
        method: 'POST',
        body: createProductParams,
      }),
      invalidatesTags: ['RETRIEVED_PRODUCTS'],
    }),

    updateProduct: builder.mutation<
      Product,
      { id: string; updateProductParams: UpdateProductParams }
    >({
      query: ({ id, updateProductParams }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: updateProductParams,
      }),
      invalidatesTags: (_result, error, { id }) =>
        error ? [] : ['RETRIEVED_PRODUCTS', { type: 'RETRIEVED_PRODUCT', id }],
    }),

    setProductActive: builder.mutation<
      Product,
      { id: string; active: boolean }
    >({
      query: ({ id, active }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body: { active },
      }),
      invalidatesTags: (_result, error, { id }) =>
        error ? [] : ['RETRIEVED_PRODUCTS', { type: 'RETRIEVED_PRODUCT', id }],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RETRIEVED_PRODUCTS'],
    }),

    uploadProductImage: builder.mutation<
      ProductImage,
      { productId: string; file: File }
    >({
      query: ({ productId, file }) => {
        const formData = new FormData()
        formData.append('file', file)
        return {
          url: `/products/${productId}/images`,
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: (_result, _error, { productId }) => [
        'RETRIEVED_PRODUCTS',
        { type: 'RETRIEVED_PRODUCT', id: productId },
      ],
    }),

    deleteProductImage: builder.mutation<
      void,
      { productId: string; imageId: string }
    >({
      query: ({ productId, imageId }) => ({
        url: `/products/${productId}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        'RETRIEVED_PRODUCTS',
        { type: 'RETRIEVED_PRODUCT', id: productId },
      ],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useSetProductActiveMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
  useDeleteProductImageMutation,
} = productsApi
