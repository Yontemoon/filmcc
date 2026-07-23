import { Container, Group } from '@mantine/core'
import classes from './header.module.css'
import Button from '#/components/ui/button'
import { Link } from '@tanstack/react-router'

export function HomeHeader() {
  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <div>Film CC</div>
        <Group gap={2}>
          <Link to="/signin">
            <Button variant="transparent">Sign In</Button>
          </Link>
          <Link to="/signup">
            <Button>Register</Button>
          </Link>
        </Group>
      </Container>
    </header>
  )
}
