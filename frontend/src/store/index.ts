import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from 'react-redux'
import { authApi } from './apis/auth-api'
import { cartApi } from './apis/cart-api'
import { ordersApi } from './apis/orders-api'
import { productsApi } from './apis/products-api'
import { authReducer } from './slices/auth-slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(productsApi.middleware)
      .concat(cartApi.middleware)
      .concat(ordersApi.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} from './apis/auth-api'

export {
  useCreateProductMutation,
  useDeleteProductImageMutation,
  useDeleteProductMutation,
  useGetProductByIdQuery,
  useGetProductsQuery,
  useSetProductActiveMutation,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from './apis/products-api'

export {
  useAddCartItemMutation,
  useCheckoutMutation,
  useGetCartQuery,
  useRemoveCartItemMutation,
} from './apis/cart-api'

export { useGetMyOrdersQuery, useGetOrderByIdQuery } from './apis/orders-api'

export { clearAuth, setAuth } from './slices/auth-slice'
