import { modals } from '@mantine/modals'
import { Route } from '#/routes/_authenticated'
import { Anchor, Flex, Text, Title } from '@mantine/core'
import Button from '../ui/button'

const AchieveBlock = () => {
  const { user } = Route.useRouteContext()
  const isGuest = user.isAnonymous
  const username = user.username

  return isGuest ? (
    <Flex direction="column" align={'center'} gap={'lg'}>
      <Title size={'xl'}>Checkout other daily games from the past.</Title>
      <Text size="lg">
        Create an account for free to play previous daily games!
      </Text>
      <Anchor href="/signup">
        <Button>Create a free account</Button>
      </Anchor>
    </Flex>
  ) : (
    <div>Hi, {username}</div>
  )
}

const ModalAchieveBlock = () => {
  return modals.open({
    centered: true,
    children: <AchieveBlock />,
    onClose() {},
  })
}

export default ModalAchieveBlock
