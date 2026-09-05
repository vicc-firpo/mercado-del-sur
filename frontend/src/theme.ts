import { createTheme, type MantineColorsTuple } from '@mantine/core'

const primary: MantineColorsTuple = [
  '#f7f3f2',
  '#e8e6e5',
  '#d2c9c6',
  '#bdaaa4',
  '#ab9087',
  '#a17f74',
  '#9d766a',
  '#896459',
  '#7b594e',
  '#5d4037',
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
