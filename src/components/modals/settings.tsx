import { modals } from '@mantine/modals'
import { useDisclosure } from '@mantine/hooks'
import {
  useMantineColorScheme,
  Group,
  Text,
  Flex,
  Switch,
  Divider,
} from '@mantine/core'
import Button from '../ui/button'
import { signOut } from '#/lib/auth-client'
import { Route } from '#/routes/_authenticated'
import { useEntitiesProvider } from '#/provider/entites'

const SettingsChild = () => {
  const { user } = Route.useRouteContext()
  const isAnon = user.isAnonymous
  const [_opened, { close }] = useDisclosure(false)
  const { hideUsedEntities, toggleShowEntities } = useEntitiesProvider()
  const { setColorScheme, colorScheme } = useMantineColorScheme({
    keepTransitions: true,
  })

  return (
    <Group>
      <Flex align={'center'} justify={'space-between'} w={'100%'}>
        <Text>Dark Theme</Text>
        <Switch
          defaultChecked={colorScheme === 'dark'}
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
      <Flex align={'center'} justify={'space-between'} w={'100%'}>
        <Text>Hide Used Entities</Text>
        <Switch
          defaultChecked={hideUsedEntities === false}

          onChange={() => {
            toggleShowEntities()
          }}
        />
      </Flex>
      <Divider my="md" w={'100%'} />
      {!isAnon && (
        <Flex justify={'end'} w={'100%'}>
          <Button
            variant="default"
            onClick={async (e) => {
              try {
                e.preventDefault()
                e.stopPropagation()
                const { error } = await signOut()
                if (error) {
                  console.error('Error signing out', error)
                  throw new Error(error.message)
                }
                close()
              } catch (error) {
                return error
              }
            }}
          >
            Signout
          </Button>
        </Flex>
      )}
    </Group>
  )
}

const ModalSetting = () => {
  return modals.open({
    title: 'Settings',
    centered: true,
    children: <SettingsChild />,
  })
}

export default ModalSetting
