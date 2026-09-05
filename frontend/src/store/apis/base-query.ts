import { ROUTES } from '@/constants/routes'
import type {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query'
import { fetchBaseQuery } from '@reduxjs/toolkit/query'
import type { RootState } from '..'
import { clearAuth } from '../slices/auth-slice'

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api: BaseQueryApi, extraOptions: object) => {
  const result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401 && api.endpoint !== 'login') {
    api.dispatch(clearAuth())
    if (window.location.pathname !== ROUTES.LOGIN) {
      window.location.assign(ROUTES.LOGIN)
    }
  }

  return result
}

export function isApiError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}
