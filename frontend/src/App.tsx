import { AdminRoute } from '@/components/AdminRoute'
import { StoreLayout } from '@/components/layouts/store-layout/StoreLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ROUTES } from '@/constants/routes'
import AdminProductDetailPage from '@/pages/admin-product-detail'
import AdminProductsPage from '@/pages/admin-products'
import CartPage from '@/pages/cart'
import CatalogPage from '@/pages/catalog'
import CheckoutCancelPage from '@/pages/checkout-cancel'
import CheckoutSuccessPage from '@/pages/checkout-success'
import LoginPage from '@/pages/login'
import NotFoundPage from '@/pages/not-found'
import OrderDetailPage from '@/pages/order-detail'
import OrdersPage from '@/pages/orders'
import ProductDetailPage from '@/pages/product-detail'
import RegisterPage from '@/pages/register'
import { store } from '@/store'
import { theme } from '@/theme'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './global.css'
import './i18n'

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications />
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route element={<StoreLayout />}>
              <Route path={ROUTES.CATALOG} element={<CatalogPage />} />
              <Route
                path={ROUTES.PRODUCT_DETAIL}
                element={<ProductDetailPage />}
              />
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path={ROUTES.CART} element={<CartPage />} />
                <Route
                  path={ROUTES.CHECKOUT_SUCCESS}
                  element={<CheckoutSuccessPage />}
                />
                <Route
                  path={ROUTES.CHECKOUT_CANCEL}
                  element={<CheckoutCancelPage />}
                />
                <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
                <Route
                  path={ROUTES.ORDER_DETAIL}
                  element={<OrderDetailPage />}
                />
              </Route>

              <Route element={<AdminRoute />}>
                <Route path={ROUTES.ADMIN} element={<AdminProductsPage />} />
                <Route
                  path={ROUTES.ADMIN_PRODUCT_DETAIL}
                  element={<AdminProductDetailPage />}
                />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </MantineProvider>
  )
}

export default App
