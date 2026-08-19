import {
  createTheme,
  defaultVariantColorsResolver,
  MantineProvider as MantineClientProvider,
} from '@mantine/core'
import type { MantineColorsTuple, VariantColorsResolver } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'

const brandColors: MantineColorsTuple = [
  '#f5f5f5',
  '#e7e7e7',
  '#cdcdcd',
  '#b2b2b2',
  '#9a9a9a',
  '#8b8b8b',
  '#848484',
  '#717171',
  '#656565',
  '#000000',
]

const variantColorResolver: VariantColorsResolver = (input) => {
  const resolved = defaultVariantColorsResolver(input)

  if (input.variant === 'filled' && input.color === input.theme.primaryColor) {
    return { ...resolved, color: 'var(--mantine-primary-color-contrast)' }
  }

  return resolved
}

const theme = createTheme({
  autoContrast: true,
  variantColorResolver,

  colors: {
    brandColors,
  },
  primaryColor: 'brandColors',
  primaryShade: {
    dark: 0,
    light: 9,
  },
  scale: 1,
  radius: {
    xs: '0',
    sm: '0',
    md: '0',
  },
  focusRing: 'always',
  lineHeights: {
    xs: '1.4',
    sm: '1.45',
    md: '1.7',
    lg: '1.6',
    xl: '1.65',
  },
})

const MantineProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <MantineClientProvider theme={theme} defaultColorScheme={'light'}>
      <ModalsProvider>{children}</ModalsProvider>
    </MantineClientProvider>
  )
}

export default MantineProvider
