import { createTheme, type MantineColorsTuple } from '@mantine/core'

const primary: MantineColorsTuple = [
  '#f6f3f2',
  '#e4dcd9',
  '#ccbbb2',
  '#b4998b',
  '#a07d6b',
  '#946c58',
  '#8f654f',
  '#79523f',
  '#5f4032',
  '#37221a',
]

const secondary: MantineColorsTuple = [
  '#eef4ee',
  '#dde8de',
  '#b7d1ba',
  '#8fb994',
  '#6da372',
  '#57955d',
  '#498f51',
  '#387b41',
  '#2e6d38',
  '#1f5e2b',
]

const gray: MantineColorsTuple = [
  '#f0f0f0',
  '#e7e7e7',
  '#cdcdcd',
  '#b2b2b2',
  '#9a9a9a',
  '#8b8b8b',
  '#848484',
  '#717171',
  '#656565',
  '#575757',
]

const FONT_FAMILY =
  'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'

export const theme = createTheme({
  colors: {
    primary,
    secondary,
    gray,
  },
  white: '#f5f5f5',
  black: primary[9],
  primaryColor: 'primary',
  defaultRadius: 'md',
  fontFamily: FONT_FAMILY,
  headings: {
    fontFamily: FONT_FAMILY,
  },
})
