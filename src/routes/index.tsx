import { createFileRoute, Link } from '@tanstack/react-router'
import { Title, Group, Text, AppShell, Container, Flex } from '@mantine/core'
import Button from '#/components/ui/button'

import { HomeHeader } from '#/components/pages/home/header'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <HomeHeader />

      <Container maw={960}>
        <Flex gap={'lg'} direction={'column'} align={'start'}>
          <Title>
            Test your knowledge of chaining movies and people together.
          </Title>
          <Text>
            Connect audiences to all of your content with just one link. Claim
            your unique link and start personalizing your link page. It is
            totally free.
          </Text>

          <Button radius={'sm'} size="lg">
            <Link to={'/game'}>Try out a game</Link>
          </Button>
        </Flex>
      </Container>
    </AppShell>
  )
}
