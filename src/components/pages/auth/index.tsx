import { Anchor, Button, Paper, Text, Title } from '@mantine/core'
import classes from './auth.module.css'
import { TextInput, PasswordInput } from '#/components/ui/input'
import Checkbox from '#/components/ui/checkbox'
import { Link, useNavigate } from '@tanstack/react-router'
import { signIn, signUp } from '#/lib/auth-client'
import { useForm, isEmail, hasLength, matchesField } from '@mantine/form'
import type { UseFormReturnType } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { authFailure, thrownFailure } from '#/lib/auth-errors'
import type { TAuthFailure } from '#/lib/auth-errors'

const reportFailure = <T extends Record<string, unknown>>(
  form: UseFormReturnType<T>,
  title: string,
  failure: TAuthFailure,
) => {
  if (failure.field && failure.field in form.getValues()) {
    form.setFieldError(failure.field, failure.message)
  }

  notifications.show({
    title,
    message: failure.message,
    color: 'red',
  })
}

type SignInInt = {
  email: string
  password: string
  rememberMe: boolean
}

const SigninComp = () => {
  const form = useForm<SignInInt>({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
    validate: {
      email: isEmail('Invalid email'),
    },
  })

  const navigate = useNavigate()

  const handleSignIn = async (values: SignInInt) => {
    try {
      // Signing in on top of the anonymous session is deliberate: the anonymous
      // plugin only links this game's attempts to the real account while that
      // session is still live, and a failed attempt leaves the guest untouched.
      const { error } = await signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      })

      if (error) {
        console.error('[Error Signing In]: ', error)
        reportFailure(form, 'Sign in failed', authFailure(error))
        return
      }

      notifications.show({
        title: 'Welcome back!',
        message: 'You are signed in.',
        color: 'teal',
      })

      await navigate({ to: '/' })
    } catch (error) {
      console.error('[Error Signing In]: ', error)
      reportFailure(form, 'Sign in failed', thrownFailure(error))
    }
  }
  return (
    <form onSubmit={form.onSubmit(handleSignIn)}>
      <div className={classes.wrapper}>
        <Paper className={classes.form}>
          <Title order={2} className={classes.title}>
            Welcome back to FilmCC!
          </Title>

          <TextInput
            label="Email address"
            placeholder="hello@gmail.com"
            size="md"
            radius="sm"
            key={form.key('email')}
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            mt="md"
            size="md"
            radius="sm"
            key={form.key('password')}
            {...form.getInputProps('password')}
          />
          <Checkbox
            label="Keep me logged in"
            mt="xl"
            size="sm"
            key={form.key('rememberMe')}
            {...form.getInputProps('rememberMe', { type: 'checkbox' })}
          />
          <Button
            fullWidth
            mt="xl"
            size="md"
            radius="sm"
            type="submit"
            loading={form.submitting}
          >
            Login
          </Button>

          <Text ta="center" mt="md">
            Don&apos;t have an account?{' '}
            <Anchor fw={500} component={Link} to="/signup" ml={'xs'}>
              Register
            </Anchor>
          </Text>
        </Paper>
      </div>
    </form>
  )
}
type SigninForm = {
  username: string
  email: string
  password: string
  confirmPassword: string
  keepLoggedIn: boolean
}

const SignUpComp = () => {
  const form = useForm<SigninForm>({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      keepLoggedIn: false,
    },
    validate: {
      username: hasLength(
        { min: 5, max: 20 },
        'Name must be 5-20 characters long',
      ),
      email: isEmail('Invalid email'),
      password: (value) =>
        value.length < 6 ? 'Password must be at least 6 characters' : null,
      confirmPassword: matchesField('password', 'Passwords are not the same'),
    },
  })
  const navigate = useNavigate()

  const handleAccountCreation = async (values: SigninForm) => {
    try {
      const { error } = await signUp.email({
        email: values.email,
        name: values.username,
        password: values.password,
        username: values.username,
        displayUsername: values.username,
      })

      if (error) {
        console.error('[Error Creating Account]: ', error)
        reportFailure(form, 'Could not create your account', authFailure(error))
        return
      }

      notifications.show({
        title: 'Account created',
        message: 'Your guest progress has been saved to your account.',
        color: 'teal',
      })

      await navigate({
        to: '/archive',
      })
    } catch (error) {
      console.error('[Error Creating Account]: ', error)
      reportFailure(form, 'Could not create your account', thrownFailure(error))
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleAccountCreation)}>
      <div className={classes.wrapper}>
        <Paper className={classes.form}>
          <Title order={2} className={classes.title}>
            Welcome to FilmCC
          </Title>

          <TextInput
            withAsterisk
            // className="striped-active"
            label="Username"
            placeholder="Superman22"
            size="md"
            radius="md"
            key={form.key('username')}
            {...form.getInputProps('username')}
          />

          <TextInput
            withAsterisk
            className={classes.email}
            label="Email address"
            placeholder="hello@gmail.com"
            size="md"
            mt="md"
            radius="md"
            key={form.key('email')}
            {...form.getInputProps('email')}
          />

          <PasswordInput
            withAsterisk
            label="Password"
            placeholder="Your password"
            mt="md"
            size="md"
            radius="md"
            key={form.key('password')}
            {...form.getInputProps('password')}
          />

          <PasswordInput
            withAsterisk
            label="Confirm Password"
            placeholder="Your password"
            mt="md"
            size="md"
            radius="md"
            key={form.key('confirmPassword')}
            {...form.getInputProps('confirmPassword')}
          />

          <Checkbox
            label="Keep me logged in"
            mt="xl"
            size="sm"
            key={form.key('keepLoggedIn')}
            {...form.getInputProps('keepLoggedIn', { type: 'checkbox' })}
          />

          <Button
            fullWidth
            mt="xl"
            size="md"
            type="submit"
            loading={form.submitting}
          >
            Create Account
          </Button>

          <Text ta="center" mt="md">
            Have an account?{' '}
            <Anchor fw={500} component={Link} to="/signin" ml="xs">
              Sign In
            </Anchor>
          </Text>
        </Paper>
      </div>
    </form>
  )
}

export { SigninComp, SignUpComp }
