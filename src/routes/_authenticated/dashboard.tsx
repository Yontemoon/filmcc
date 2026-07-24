import { createFileRoute, useNavigate } from '@tanstack/react-router'
import Button from '#/components/ui/button'
import { AppShell, Container, Flex, Title } from '@mantine/core'
import { signOut } from '#/lib/auth-client'
import { notifications } from '@mantine/notifications'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const context = Route.useRouteContext()
  return (
    <AppShell padding={'lg'}>
      <Container>
        <Flex gap={'lg'} direction={'column'} align={'start'} columnGap={'lg'}>
          <Button
            variant="outline"
            onClick={() => {
              signOut({
                fetchOptions: {
                  onSuccess: () => {
                    navigate({
                      to: '/',
                    })
                  },
                  onError: () => {
                    notifications.show({
                      title: 'Something went wrong!',
                      message: 'Cannot sign you out.',
                    })
                  },
                },
              })
            }}
          >
            Sign Out
          </Button>
          <Title>Hello, {context.user.name}</Title>
        </Flex>
      </Container>
    </AppShell>
  )
}
