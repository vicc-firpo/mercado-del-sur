import { AdminRoute } from '@/components/AdminRoute'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ROUTES } from '@/constants/routes'
import AdminProductDetailPage from '@/pages/admin/product-detail-page'
import AdminProductsPage from '@/pages/admin/products-page'
import LoginPage from '@/pages/auth/login-page'
import RegisterPage from '@/pages/auth/register-page'
import CartPage from '@/pages/cart/cart-page'
import CheckoutCancelPage from '@/pages/cart/checkout-cancel-page'
import CheckoutSuccessPage from '@/pages/cart/checkout-success-page'
import NotFoundPage from '@/pages/not-found-page'
import OrderDetailPage from '@/pages/orders/order-detail-page'
import OrdersPage from '@/pages/orders/orders-page'
import CatalogPage from '@/pages/products/products-page'
import ProductDetailPage from '@/pages/products/product-detail-page'
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
            <Route element={<Layout />}>
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
