// src/start.ts
import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from '@tanstack/react-start'
import { auth } from '#/lib/auth'
import { getRequestHeaders } from '@tanstack/react-start/server'

// Called on a global middlware (/src/start.ts)
const authMiddlware = createMiddleware().server(async ({ next }) => {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })
  const result = next({
    context: { session: session?.user ?? null },
  })
  return result
})

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
})
export const startInstance = createStart(() => {
  return {
    requestMiddleware: [csrfMiddleware, authMiddlware],
  }
})
