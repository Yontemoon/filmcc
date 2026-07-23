import { createFileRoute } from '@tanstack/react-router'
import { SigninComp } from '#/components/pages/auth'

export const Route = createFileRoute('/signin')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SigninComp />
}
