import { Checkbox as CheckboxMantine } from '@mantine/core'
import type { CheckboxProps } from '@mantine/core'
import classes from './checkbox.module.css'

const Checkbox = ({ ...props }: CheckboxProps) => {
  return (
    <CheckboxMantine
      classNames={{
        input: classes.input,

        icon: classes.icon,
      }}
      {...props}
    />
  )
}
export default Checkbox
