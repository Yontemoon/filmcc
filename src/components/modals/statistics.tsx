import { modals } from '@mantine/modals'
import { Route } from '#/routes/_authenticated/game.index'

const StatsBody = () => {
  const { session } = Route.useRouteContext()
  const isGuest = session.isAnonymous

  return isGuest ? <div>You are a guest</div> : <div>Hello person</div>
}

const ModalStatistics = () => {
  return modals.open({
    title: 'Statistics',
    centered: true,
    children: <StatsBody />,
  })
}

export default ModalStatistics
