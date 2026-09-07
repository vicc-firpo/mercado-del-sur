const formatter = new Intl.NumberFormat('es-UY', {
  style: 'currency',
  currency: 'UYU',
  maximumFractionDigits: 0,
})

export const formatPrice = (value: number): string => formatter.format(value)
