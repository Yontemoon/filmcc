import React from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@mantine/core'
import type { ButtonProps, ElementProps } from '@mantine/core'

interface CustomButtonProps
  extends ButtonProps, ElementProps<typeof Link, keyof ButtonProps> {}

type ButtonLinkProps = {
  children: React.ReactNode
  LinkProps: CustomButtonProps
}

export const ButtonLink = ({ children, LinkProps }: ButtonLinkProps) => {
  return (
    <Button component={Link} {...LinkProps}>
      {children}
    </Button>
  )
}

export default ButtonLink
