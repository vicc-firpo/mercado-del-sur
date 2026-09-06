import { createTheme, type MantineColorsTuple } from '@mantine/core'

const primary: MantineColorsTuple = [
  '#f5f3f1',
  '#e0dbd7',
  '#beb6af',
  '#968b82',
  '#6c625a',
  '#473e37',
  '#231e1a',
  '#1e1a16',
  '#181512',
  '#12100e',
]

const secondary: MantineColorsTuple = [
  '#f4efeb',
  '#e7ded4',
  '#d5c5b4',
  '#c2ab92',
  '#b19375',
  '#a78566',
  '#a17d5b',
  '#8d6b4b',
  '#7d5e40',
  '#6c4f34',
]

const blue: MantineColorsTuple = [
  '#ecf2fb',
  '#d6e1f1',
  '#aac0e2',
  '#7c9dd2',
  '#5980c5',
  '#436fbe',
  '#3766bb',
  '#2955a4',
  '#224b93',
  '#154081',
]

const red: MantineColorsTuple = [
  '#fceeef',
  '#f2d4d6',
  '#e5a9ad',
  '#d2797f',
  '#c45a61',
  '#bd424a',
  '#b73841',
  '#a32931',
  '#95232a',
  '#7f151c',
]

const green: MantineColorsTuple = [
  '#e9f6ec',
  '#d3ecd9',
  '#a6d8b4',
  '#75c28c',
  '#4fb06b',
  '#37a556',
  '#279e49',
  '#188a3b',
  '#0c7a31',
  '#006926',
]

const yellow: MantineColorsTuple = [
  '#fdf7e3',
  '#f7ecc6',
  '#efd88c',
  '#e8c451',
  '#e2b422',
  '#dfab08',
  '#dea300',
  '#c58e00',
  '#af7d00',
  '#976a00',
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
    blue,
    red,
    green,
    yellow,
    gray,
  },
  white: '#f5f5f5',
  black: '#0f1b2d',
  primaryColor: 'primary',
  defaultRadius: 'md',
  fontFamily: FONT_FAMILY,
  headings: {
    fontFamily: FONT_FAMILY,
  },
})
