import { getRequestHeaders } from '@tanstack/react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { auth } from './auth'

const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  return session
})

const ensureSession = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw new Error('Unauthorized')
  }

  return session
})

const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw new Error('Unauthorized')
  }

  return auth.api.signOut()
})

const signInAnon = createServerFn({ method: 'POST' }).handler(async () => {
  // √

  // const headers = getRequestHeaders()
  const signInRes = await auth.api.signInAnonymous()
  if (!signInRes.token) {
    throw new Error('Something wrong happened')
  }

  return signInRes.user
})

export { getSession, ensureSession, signOut, signInAnon }
