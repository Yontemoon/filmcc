import { Route } from '#/routes/_authenticated'
import { ActionIcon, Group } from '@mantine/core'

import {
  ChartBarBig,
  Settings,
  CircleQuestionMark,
  Archive,
} from 'lucide-react'
import classes from './game-header.module.css'
import Button from '../ui/buttons/button'
import { Link } from '@tanstack/react-router'
import ModalSetting from '../modals/settings'
import ModalHowTo from '../modals/how-to'
import ModalAchieveBlock from '../modals/achieve-block'
import ModalStatsBlock from '../modals/stats-block'

const links = [
  { modalOpen: ModalHowTo, icon: <CircleQuestionMark /> },
  { modalOpen: ModalSetting, icon: <Settings /> },
]

const GameHeader = () => {
  const { user } = Route.useRouteContext()
  const isGuest = user.isAnonymous === true

  const items = links.map((link, i) => (
    <ActionIcon
      variant="transparent"
      size="lg"
      key={i}
      onClick={() => {
        link.modalOpen()
      }}
    >
      {link.icon}
    </ActionIcon>
  ))

  return (
    <div className={classes.header}>
      <div className={classes.inner}>
        <div>Film CC</div>
        <div className={classes.rightInner}>
          <Group gap={'sm'}>
            {isGuest ? (
              <>
                <ActionIcon
                  variant="transparent"
                  size="lg"
                  onClick={() => {
                    ModalAchieveBlock()
                  }}
                >
                  <Archive />
                </ActionIcon>
                <ActionIcon
                  variant="transparent"
                  size="lg"
                  onClick={() => {
                    ModalStatsBlock()
                  }}
                >
                  <ChartBarBig />
                </ActionIcon>
              </>
            ) : (
              <>
                <Link to="/archive">
                  <Archive />
                </Link>
                <Link to="/stats">
                  <ChartBarBig />
                </Link>
              </>
            )}
            {items}
          </Group>
          {isGuest && (
            <Link to="/signup">
              <Button variant="outline">Sign Up</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default GameHeader
