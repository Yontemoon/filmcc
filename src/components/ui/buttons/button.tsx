import { Button as MantineButton } from '@mantine/core'
import type { ButtonProps } from '@mantine/core'

const Button = ({
  children,
  ...props
}: ButtonProps &
  React.ComponentProps<typeof MantineButton> &
  React.ComponentProps<'button'> & {
    children: React.ReactNode
  }) => {
  return <MantineButton {...props}>{children}</MantineButton>
}

export default Button
