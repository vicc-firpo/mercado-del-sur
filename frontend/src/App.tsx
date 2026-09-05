import { AdminRoute } from '@/components/AdminRoute'
import { AdminLayout } from '@/components/layouts/admin-layout/AdminLayout'
import { StoreLayout } from '@/components/layouts/store-layout/StoreLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ROUTES } from '@/constants/routes'
import AdminProductsPage from '@/pages/admin-products'
import AdminUsersPage from '@/pages/admin-users'
import CartPage from '@/pages/cart'
import CatalogPage from '@/pages/catalog'
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
                <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
                <Route
                  path={ROUTES.ORDER_DETAIL}
                  element={<OrderDetailPage />}
                />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path={ROUTES.ADMIN} element={<AdminProductsPage />} />
                <Route
                  path={ROUTES.ADMIN_PRODUCTS}
                  element={<AdminProductsPage />}
                />
                <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </MantineProvider>
  )
}

export default App
