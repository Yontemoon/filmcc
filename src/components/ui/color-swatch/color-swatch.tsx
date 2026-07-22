import { ColorSwatch as CS } from '@mantine/core'
import type { ColorSwatchProps } from '@mantine/core'
import classes from './color-swatch.module.css'

interface PropTypes extends ColorSwatchProps {
  withShadow?: boolean
  children?: React.ReactNode
}

const ColorSwatch = ({ withShadow = false, ...props }: PropTypes) => {
  return (
    <CS
      withShadow={withShadow}
      className={classes.ColorSwatchContainer}
      {...props}
    ></CS>
  )
}

export default ColorSwatch
