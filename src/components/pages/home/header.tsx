import { Container, Group } from '@mantine/core'
import classes from './header.module.css'
import Button from '#/components/ui/button'
import { Link } from '@tanstack/react-router'
import { useSession } from '#/lib/auth-client'
import Spinner from '#/components/ui/spinner'

export function HomeHeader() {
  const { data, isPending } = useSession()

  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <div>Film CC</div>

        {isPending ? (
          <Spinner />
        ) : !data ? (
          <Group gap={2}>
            <Link to="/signin">
              <Button variant="transparent">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button>Register</Button>
            </Link>
          </Group>
        ) : (
          <Button>Go Here</Button>
        )}
      </Container>
    </header>
  )
}
