import { Route } from '#/routes/_authenticated/game.index'
import {
  ActionIcon,
  Burger,
  Divider,
  Drawer,
  Group,
  ScrollArea,
  Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { ChartBarBig, Settings, CircleQuestionMark } from 'lucide-react'
import { modals } from '@mantine/modals'
import classes from './game-header.module.css'
import Button from '../ui/button'
import { Link } from '@tanstack/react-router'

const openDeleteModal = () =>
  modals.openConfirmModal({
    title: 'Delete your profile',
    centered: true,
    children: (
      <Text size="sm">
        Are you sure you want to delete your profile? This action is destructive
        and you will have to contact support to restore your data.
      </Text>
    ),
    labels: { confirm: 'Delete account', cancel: "No don't delete it" },
    confirmProps: { color: 'red' },
    onCancel: () => console.log('Cancel'),
    onConfirm: () => console.log('Confirmed'),
  })
const links = [
  { modalOpen: openDeleteModal, icon: <ChartBarBig /> },
  { modalOpen: openDeleteModal, icon: <CircleQuestionMark /> },
  { modalOpen: openDeleteModal, icon: <Settings /> },
]

const GameHeader = () => {
  const { user } = Route.useRouteContext()
  const isGuest = user.isAnonymous === true

  const [opened, { toggle, close }] = useDisclosure(false)

  const items = links.map((link, i) => (
    <ActionIcon
      variant="transparent"
      size="xl"
      key={i}
      onClick={() => {
        link.modalOpen()
      }}
    >
      {link.icon}
    </ActionIcon>
  ))

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <div>Film CC</div>
        <div className={classes.rightInner}>
          <Group visibleFrom="xs">{items}</Group>
          {isGuest && (
            <Button variant="outline">
              <Link to="/signup">Sign Up</Link>
            </Button>
          )}
        </div>

        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="xs"
          size="sm"
          aria-label="Toggle navigation"
        />
      </div>

      <Drawer
        opened={opened}
        onClose={close}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="xs"
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - 80px" mx="-md">
          <Divider my="sm" />
          {items}
        </ScrollArea>
      </Drawer>
    </header>
  )
}

export default GameHeader
