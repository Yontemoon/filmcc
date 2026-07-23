import { Anchor, Button, Paper, Text, Title } from '@mantine/core'
import classes from './auth.module.css'
import { TextInput, PasswordInput } from '#/components/ui/input'
import Checkbox from '#/components/ui/checkbox'
import { Link } from '@tanstack/react-router'
import { signIn, signUp } from '#/lib/auth-client'
import { useForm, isEmail, hasLength, matchesField } from '@mantine/form'

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
          radius="sm"
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          mt="md"
          size="md"
          radius="sm"
        />
        <Checkbox label="Keep me logged in" mt="xl" size="sm" />
        <Button fullWidth mt="xl" size="md" radius="sm">
          Login
        </Button>

        <Text ta="center" mt="md">
          Don&apos;t have an account? {/* <Link to={'/signup'}> */}
          <Anchor fw={500} component={Link} to="/signup">
            Register
          </Anchor>
          {/* </Link> */}
        </Text>
      </Paper>
    </div>
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

  const handleAccountCreation = async (values: SigninForm) => {
    try {
      console.log(values)
      const response = await signUp.email({
        email: values.email,

        name: values.username,
        password: values.password,
        username: values.username,
        displayUsername: values.username,
      })
      console.log(response)
    } catch (error) {
      console.error('Account creation failed:', error)
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
            size="md"
            key={form.key('keepLoggedIn')}
            {...form.getInputProps('keepLoggedIn', { type: 'checkbox' })}
          />

          <Button
            fullWidth
            mt="xl"
            size="md"
            radius="md"
            type="submit"
            loading={form.submitting}
          >
            Create Account
          </Button>

          <Text ta="center" mt="md">
            Have an account?{' '}
            <Anchor fw={500} component={Link} to="/signin">
              Sign In
            </Anchor>
          </Text>
        </Paper>
      </div>
    </form>
  )
}

export { SigninComp, SignUpComp }
