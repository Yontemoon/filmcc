import { betterAuth } from 'better-auth/minimal'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { username } from 'better-auth/plugins'
import db from '#/lib/db'
import * as schema from '#/lib/db/schema'

export const auth = betterAuth({
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },

  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),
  plugins: [username(), tanstackStartCookies()],
})
