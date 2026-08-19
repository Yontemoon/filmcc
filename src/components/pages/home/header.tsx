import { Container, Group } from '@mantine/core'
import classes from './header.module.css'
import Button from '#/components/ui/buttons/button'
import { Link } from '@tanstack/react-router'
import { Route } from '#/routes'

export function HomeHeader() {
  const { user } = Route.useRouteContext()

  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <div>Film CC</div>

        {!user ? (
          <Group gap={2}>
            <Link to="/signin">
              <Button variant="transparent">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button>Register</Button>
            </Link>
          </Group>
        ) : (
          <Link to="/game">
            <Button variant="transparent">Play</Button>
          </Link>
        )}
      </Container>
    </header>
  )
}
