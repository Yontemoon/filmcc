import { Button as MantineButton } from '@mantine/core'
import type { ButtonHTMLAttributes } from 'react'

const Button = ({
  children,
  ...props
}: {
  children: React.ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <MantineButton variant="filled" {...props}>
      {children}
    </MantineButton>
  )
}

export default Button
