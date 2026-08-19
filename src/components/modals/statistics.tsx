import { modals } from '@mantine/modals'
import { Route } from '#/routes/_authenticated'
import { Anchor, Flex, Text, Title } from '@mantine/core'
import Button from '../ui/buttons/button'

const StatsBody = () => {
  const { user } = Route.useRouteContext()
  const isGuest = user.isAnonymous
  const username = user.username

  return isGuest ? (
    <Flex direction="column" align={'center'} gap={'lg'}>
      <Title size={'xl'}>Track your stats and view badges</Title>
      <Text size="lg">
        Access your Film CC badges, win percentage and more with a free account.
      </Text>
      <Anchor href="/signup">
        <Button>Create a free account</Button>
      </Anchor>
    </Flex>
  ) : (
    <div>Hi, {username}</div>
  )
}

const ModalStatistics = () => {
  return modals.open({
    title: 'Statistics',
    centered: true,
    children: <StatsBody />,
    onClose() {},
  })
}

export default ModalStatistics
