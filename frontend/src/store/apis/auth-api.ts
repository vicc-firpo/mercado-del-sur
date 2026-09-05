import type { AuthResponse } from '@/types/auth/auth-response'
import type { ChangePasswordParams } from '@/types/auth/change-password-params'
import type { LoginParams } from '@/types/auth/login-params'
import type { RegisterParams } from '@/types/auth/register-params'
import { createApi } from '@reduxjs/toolkit/query/react'
import { clearAuth, setAuth } from '../slices/auth-slice'
import { baseQueryWithAuth } from './base-query'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginParams>({
      query: (loginParams) => ({
        url: '/auth/login',
        method: 'POST',
        body: loginParams,
      }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled
        dispatch(setAuth(data))
      },
    }),

    register: builder.mutation<AuthResponse, RegisterParams>({
      query: (registerParams) => ({
        url: '/auth/register',
        method: 'POST',
        body: registerParams,
      }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled
        dispatch(setAuth(data))
      },
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled
        } finally {
          dispatch(clearAuth())
        }
      },
    }),

    changePassword: builder.mutation<void, ChangePasswordParams>({
      query: (changePasswordParams) => ({
        url: '/auth/change-password',
        method: 'PATCH',
        body: changePasswordParams,
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useChangePasswordMutation,
} = authApi
