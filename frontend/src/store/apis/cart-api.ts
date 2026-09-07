import type { Cart, CartItem } from '@/types/cart/cart'
import type { UpdateCartItemParams } from '@/types/cart/update-cart-item-params'
import type { CheckoutSession } from '@/types/checkout/checkout-session'
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './base-query'

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

    checkout: builder.mutation<CheckoutSession, void>({
      query: () => ({ url: '/cart/checkout', method: 'POST' }),
    }),
  }),
})

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useRemoveCartItemMutation,
  useCheckoutMutation,
} = cartApi
