import { createFileRoute, Link } from '@tanstack/react-router'
import { AppShell, Container, Flex } from '@mantine/core'
import Button from '#/components/ui/button'

import { HomeHeader } from '#/components/pages/home/header'
import { Suspense } from 'react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <Container maw={960}>
        <Suspense>
          <HomeHeader />
        </Suspense>
        <Flex gap={'lg'} direction={'column'} align={'start'} columnGap={'lg'}>
          <h1 className="text-6xl font-black ">
            Test your knowledge of chaining movies and people together.
          </h1>
          <div className="text-gray-500 text-2xl">
            Connect audiences to all of your content with just one link. Claim
            your unique link and start personalizing your link page. It is
            totally free.
          </div>
          <div className="flex justify-end w-full">
            <Button radius={'sm'} size="lg">
              <Link to={'/game'}>Test your knowledge</Link>
            </Button>
          </div>
        </Flex>
      </Container>
    </AppShell>
  )
}
