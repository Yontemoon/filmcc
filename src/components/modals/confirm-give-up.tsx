import { modals } from '@mantine/modals'
import { Flex, Text, Title } from '@mantine/core'
import { Button } from '../ui/buttons'

const ConfirmGiveUp = ({ callback }: { callback: () => void }) => {
  return (
    <Flex direction="column" align={'center'} gap={'lg'}>
      <Title size={'xl'}>Are you sure you want to give up?</Title>
      <Text size="lg">You cannot play this round again if you give up.</Text>
      <Button
        onClick={() => {
          callback()
          modals.closeAll()
        }}
      >
        I give up!
      </Button>
    </Flex>
  )
}

const ModalConfirmGiveUp = (callback: () => void) => {
  return modals.open({
    title: 'Give Up',
    centered: true,
    children: <ConfirmGiveUp callback={callback} />,
    onClose() {},
  })
}

export default ModalConfirmGiveUp
