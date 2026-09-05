import type { Cart, CartItem } from '@/types/cart/cart'
import type { UpdateCartItemParams } from '@/types/cart/update-cart-item-params'
import type { OrderDetail } from '@/types/orders/order'
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './base-query'
import { ordersApi } from './orders-api'

const TAG_TYPES = ['RETRIEVED_CART'] as const

export const cartApi = createApi({
  reducerPath: 'cartApi',
  tagTypes: TAG_TYPES,
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    getCart: builder.query<Cart, void>({
      query: () => ({ url: '/cart', method: 'GET' }),
      providesTags: ['RETRIEVED_CART'],
    }),

    addCartItem: builder.mutation<CartItem, UpdateCartItemParams>({
      query: ({ productId, quantity }) => ({
        url: `/cart/items/${productId}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['RETRIEVED_CART'],
    }),

    removeCartItem: builder.mutation<void, string>({
      query: (productId) => ({
        url: `/cart/items/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RETRIEVED_CART'],
    }),

    checkout: builder.mutation<OrderDetail, void>({
      query: () => ({ url: '/cart/checkout', method: 'POST' }),
      invalidatesTags: ['RETRIEVED_CART'],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        await queryFulfilled
        dispatch(ordersApi.util.invalidateTags(['RETRIEVED_ORDERS']))
      },
    }),
  }),
})

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useRemoveCartItemMutation,
  useCheckoutMutation,
} = cartApi
