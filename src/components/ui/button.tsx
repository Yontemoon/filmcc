import { Button as MantineButton } from '@mantine/core'

const Button = ({ children }: { children: React.ReactNode }) => {
  return <MantineButton variant="filled">{children}</MantineButton>
}

export default Button
