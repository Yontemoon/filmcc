import { Button as MantineButton } from '@mantine/core'
import type { ButtonProps } from '@mantine/core'

const Button = ({
  children,
  ...props
}: ButtonProps &
  React.ComponentProps<'button'> & { children: React.ReactNode }) => {
  return (
    <MantineButton variant="filled" {...props}>
      {children}
    </MantineButton>
  )
}

export default Button
