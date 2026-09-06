const formatter = new Intl.DateTimeFormat('es-UY', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
})

export const formatDate = (value: string): string =>
  formatter.format(new Date(value))
