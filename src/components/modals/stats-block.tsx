import { modals } from '@mantine/modals'
import { Flex, Text, Title } from '@mantine/core'
import { ButtonLink } from '../ui/buttons'

const StatsBlock = () => {
  return (
    <Flex direction="column" align={'center'} gap={'lg'}>
      <Title size={'xl'}>Track your stats and view badges</Title>
      <Text size="lg">
        Access your Film CC badges, win percentage and more with a free account.
      </Text>
      <ButtonLink
        LinkProps={{
          to: '/signup',
          onClick: () => {
            modals.closeAll()
          },
        }}
      >
        <>Create a free account</>
      </ButtonLink>
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
