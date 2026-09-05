const formatter = new Intl.NumberFormat('es-UY', {
  style: 'currency',
  currency: 'UYU',
  maximumFractionDigits: 0,
})

/** Formats a numeric price as Uruguayan pesos, e.g. `$ 28.500`. */
export const formatPrice = (value: number): string => formatter.format(value)
