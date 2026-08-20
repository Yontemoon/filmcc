import { Switch as MantineSwitch } from '@mantine/core'
import type { SwitchProps } from '@mantine/core'
import classes from './switch.module.css'

type PropTypes = {
  //   children: React.ReactNode
} & SwitchProps

const Switch = ({ ...props }: PropTypes) => {
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
