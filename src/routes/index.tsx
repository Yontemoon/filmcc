import { createFileRoute, useRouterState } from '@tanstack/react-router'
import { Flex, Text, Title } from '@mantine/core'
import { getSession } from '#/lib/auth.functions'
import { ButtonLink } from '#/components/ui/buttons'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const data = await getSession()
    return { user: data?.user ?? null }
  },
  component: HomePage,
})

function HomePage() {
  const { user } = Route.useRouteContext()
  const isRouterLoading = useRouterState({ select: (s) => s.isLoading })

  const today = new Date()

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  })

  const formattedDate = formatter.format(today)
  const number = 1
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
      }}
    >
      <Flex
        direction={'row'}
        align={'center'}
        justify={'center'}
        style={{
          height: '100%',
          padding: '10px',
          minHeight: '100dvh',
          overflow: 'hidden',
        }}
      >
        <Flex
          gap={'lg'}
          direction={'column'}
          align={'center'}
          columnGap={'lg'}
          style={{
            margin: '10px',
            padding: '10px',
            flexGrow: 1,
            maxWidth: '375px',
            textAlign: 'center',
          }}
        >
          <Title>Film CC</Title>
          <Text size="lg">
            Test your knowledge of connecting movies and the people that created
            them.
          </Text>
          <Flex direction={{ base: 'column', sm: 'row' }} gap={'md'} w={'100%'}>
            {!user && (
              <>
                <ButtonLink
                  LinkProps={{
                    to: '/signin',
                    size: 'lg',
                    variant: 'outline',
                    fullWidth: true,
                  }}
                >
                  Log in
                </ButtonLink>
              </>
            )}
            <ButtonLink
              LinkProps={{
                to: '/game',
                size: 'lg',
                variant: 'filled',
                fullWidth: true,
                preload: false,
              }}
            >
              {isRouterLoading ? 'Loading...' : '  Play'}
            </ButtonLink>
          </Flex>
          <Flex direction={'column'} gap={'sm'} align={'center'}>
            <div>
              <Text>{formattedDate}</Text>
            </div>
            <Text>No. {number}</Text>
          </Flex>
        </Flex>
      </Flex>
    </div>
  )
}
