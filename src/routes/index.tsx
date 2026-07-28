import { createFileRoute, Link } from '@tanstack/react-router'
import { Flex, Text } from '@mantine/core'
import Button from '#/components/ui/button'
import { getSession } from '#/lib/auth.functions'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const data = await getSession()
    return { user: data?.user ?? null }
  },
  component: HomePage,
})

function HomePage() {
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
          <h1 className="text-6xl font-black ">Film CC</h1>
          <div className="text-gray-500 text-2xl">
            Test your knowledge of connecting movies and the people that created
            them.
          </div>
          <Flex direction={{ base: 'column', sm: 'row' }} gap={'md'} w={'100%'}>
            <Link
              to="/signin"
              style={{
                flex: 1,
                width: '100%',
              }}
            >
              <Button
                radius={'lg'}
                size="lg"
                variant="outline"
                style={{
                  width: '100%',
                }}
              >
                Log in
              </Button>
            </Link>
            <Link
              to={'/game'}
              style={{
                flex: 1,
              }}
            >
              <Button
                radius={'lg'}
                size="lg"
                variant="filled"
                style={{
                  width: '100%',
                }}
              >
                Play
              </Button>
            </Link>
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
