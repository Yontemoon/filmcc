import React from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@mantine/core'
import type { ButtonProps } from '@mantine/core'
import type { LinkProps } from '@tanstack/react-router'
import classes from './button.module.css'

type ButtonLinkProps = {
  children: React.ReactNode
  ButtonProps?: ButtonProps
  LinkProps: LinkProps
}

export const ButtonLink = ({
  children,
  ButtonProps,
  LinkProps,
}: ButtonLinkProps) => {
  return (
    <Button
      {...ButtonProps}
      renderRoot={(rootProps) => (
        <Link className={classes.buttonLink} {...rootProps} {...LinkProps}>
          {children}
        </Link>
      )}
    />
  )
}

export default ButtonLink
