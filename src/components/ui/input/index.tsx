import {
  TextInput as InputMantine,
  PasswordInput as PasswordInputMantine,
} from '@mantine/core'
import type { TextInputProps, PasswordInputProps } from '@mantine/core'
import classes from './input.module.css'

const TextInput = ({ ...props }: TextInputProps) => {
  return (
    <InputMantine
      classNames={{
        input: classes.input,
      }}
      {...props}
    />
  )
}

const PasswordInput = ({ ...props }: PasswordInputProps) => {
  return (
    <PasswordInputMantine
      classNames={{
        input: classes.input,
      }}
      {...props}
    />
  )
}

export { TextInput, PasswordInput }
