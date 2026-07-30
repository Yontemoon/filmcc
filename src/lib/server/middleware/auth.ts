import { createMiddleware } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'

import { getSession } from '#/lib/auth.functions'

const guardAuthMiddlware = createMiddleware().server(async ({ next }) => {
  const userData = await getSession()
  if (!userData?.session) {
    setResponseStatus(401)
    throw new Error('Unauthorized')
  }
  return next({
    context: {
      session: userData.session,
      userDetails: userData.user,
    },
  })
})

export { guardAuthMiddlware }
