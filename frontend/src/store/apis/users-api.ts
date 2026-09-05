import type { UpdateUserParams } from '@/types/users/update-user-params'
import type { User } from '@/types/users/user'
import { createApi } from '@reduxjs/toolkit/query/react'
import type { RootState } from '..'
import { setUser } from '../slices/auth-slice'
import { baseQueryWithAuth } from './base-query'

const TAG_TYPES = ['RETRIEVED_USERS', 'RETRIEVED_USER'] as const

export const usersApi = createApi({
  reducerPath: 'usersApi',
  tagTypes: TAG_TYPES,
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => ({ url: '/users', method: 'GET' }),
      providesTags: ['RETRIEVED_USERS'],
    }),

    getUserById: builder.query<User, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'GET' }),
      providesTags: (user) => [{ type: 'RETRIEVED_USER', id: user?.id }],
    }),

    updateUser: builder.mutation<
      User,
      { id: string; updateUserParams: UpdateUserParams }
    >({
      query: ({ id, updateUserParams }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: updateUserParams,
      }),
      invalidatesTags: (_result, error, { id }) =>
        error ? [] : ['RETRIEVED_USERS', { type: 'RETRIEVED_USER', id }],
      onQueryStarted: async (_arg, { dispatch, getState, queryFulfilled }) => {
        const { data } = await queryFulfilled
        const state = getState() as RootState
        if (state.auth.user?.id === data.id) {
          dispatch(setUser(data))
        }
      },
    }),

    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['RETRIEVED_USERS'],
    }),
  }),
})

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi
