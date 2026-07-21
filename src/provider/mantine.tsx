import {
  createTheme,
  MantineProvider as MantineClientProvider,
} from '@mantine/core'

const theme = createTheme({
  primaryColor: 'teal',
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
      {children}
    </MantineClientProvider>
  )
}

export default MantineProvider
