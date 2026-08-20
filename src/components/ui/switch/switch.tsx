import { Switch as MantineSwitch } from '@mantine/core'
import type { SwitchProps } from '@mantine/core'
import classes from './switch.module.css'

const Switch = ({ ...props }: SwitchProps) => {
  return (
    <MantineSwitch
      classNames={classes}
      withThumbIndicator={false}
      radius={'xs'}
      {...props}
    />
  )
}

export default Switch
