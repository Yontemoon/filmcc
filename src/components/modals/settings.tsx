import { modals } from '@mantine/modals'
import {
  useMantineColorScheme,
  Group,
  Text,
  Flex,
  Switch,
  Divider,
} from '@mantine/core'

const ModalsSettings = () => {
  const { setColorScheme, colorScheme } = useMantineColorScheme()

  return (
    <Group>
      <Flex align={'center'} justify={'space-between'} w={'100%'}>
        <Text>Dark Theme</Text>
        <Switch
          value={colorScheme}
          onChange={() => {
            if (colorScheme === 'dark') {
              setColorScheme('light')
            } else {
              setColorScheme('dark')
            }
          }}
        />
      </Flex>
      <Divider my="md" w={'100%'} />
    </Group>
  )
}

const ModalSetting = () => {
  return modals.open({
    title: 'Settings',
    centered: true,
    children: <ModalsSettings />,
  })
}

export default ModalSetting
