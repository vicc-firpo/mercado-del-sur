import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import esAdmin from './locales/es/admin.json'
import esAuth from './locales/es/auth.json'
import esCart from './locales/es/cart.json'
import esCatalog from './locales/es/catalog.json'
import esCommon from './locales/es/common.json'
import esOrders from './locales/es/orders.json'
import esProducts from './locales/es/products.json'
import esValidation from './locales/es/validation.json'

export const DEFAULT_LANGUAGE = 'es'

i18n.use(initReactI18next).init({
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  ns: [
    'common',
    'auth',
    'catalog',
    'products',
    'cart',
    'orders',
    'admin',
    'validation',
  ],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  resources: {
    es: {
      common: esCommon,
      auth: esAuth,
      catalog: esCatalog,
      products: esProducts,
      cart: esCart,
      orders: esOrders,
      admin: esAdmin,
      validation: esValidation,
    },
  },
})

export default i18n
