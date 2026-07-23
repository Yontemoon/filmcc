import {
  Anchor,
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import classes from './auth.module.css'
import { Link } from '@tanstack/react-router'

const SigninComp = () => {
  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form}>
        <Title order={2} className={classes.title}>
          Welcome back to FilmCC!
        </Title>

        <TextInput
          label="Email address"
          placeholder="hello@gmail.com"
          size="md"
          radius="md"
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          mt="md"
          size="md"
          radius="md"
        />
        <Checkbox label="Keep me logged in" mt="xl" size="md" />
        <Button fullWidth mt="xl" size="md" radius="md">
          Login
        </Button>

        <Text ta="center" mt="md">
          Don&apos;t have an account?{' '}
          <Link to={'/signup'}>
            <Anchor fw={500}>Register</Anchor>
          </Link>
        </Text>
      </Paper>
    </div>
  )
}

const SignUpComp = () => {
  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form}>
        <Title order={2} className={classes.title}>
          Welcome to FilmCC
        </Title>
        <TextInput
          label="Username"
          placeholder="Superman22"
          size="md"
          radius="md"
        />
        <TextInput
          className={classes.email}
          label="Email address"
          placeholder="hello@gmail.com"
          size="md"
          radius="md"
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          mt="md"
          size="md"
          radius="md"
        />
        <PasswordInput
          label="Confirm Password"
          placeholder="Your password"
          mt="md"
          size="md"
          radius="md"
        />
        <Checkbox label="Keep me logged in" mt="xl" size="md" />
        <Button fullWidth mt="xl" size="md" radius="md">
          Create Account
        </Button>

        <Text ta="center" mt="md">
          Have an account?{' '}
          <Link to={'/signin'}>
            <Anchor fw={500}>Sign in</Anchor>
          </Link>
        </Text>
      </Paper>
    </div>
  )
}

export { SigninComp, SignUpComp }
