import { modals } from '@mantine/modals'
import { Anchor, Flex, Text, Title } from '@mantine/core'
import Button from '../ui/button'

const StatsBlock = () => {
  return (
    <Flex direction="column" align={'center'} gap={'lg'}>
      <Title size={'xl'}>Track your stats and view badges</Title>
      <Text size="lg">
        Access your Film CC badges, win percentage and more with a free account.
      </Text>
      <Anchor href="/signup">
        <Button>Create a free account</Button>
      </Anchor>
    </Flex>
  )
}

const ModalStatsBlock = () => {
  return modals.open({
    centered: true,
    children: <StatsBlock />,
    onClose() {},
  })
}

export default ModalStatsBlock
