import type { OrderDetail, OrderSummary } from '@/types/orders/order'
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from './base-query'

const TAG_TYPES = ['RETRIEVED_ORDERS', 'RETRIEVED_ORDER'] as const

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  tagTypes: TAG_TYPES,
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    getMyOrders: builder.query<OrderSummary[], void>({
      query: () => ({ url: '/orders', method: 'GET' }),
      providesTags: ['RETRIEVED_ORDERS'],
    }),

    getOrderById: builder.query<OrderDetail, string>({
      query: (id) => ({ url: `/orders/${id}`, method: 'GET' }),
      providesTags: (order) => [{ type: 'RETRIEVED_ORDER', id: order?.id }],
    }),
  }),
})

export const { useGetMyOrdersQuery, useGetOrderByIdQuery } = ordersApi
