import { betterAuth } from 'better-auth/minimal'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { username, anonymous } from 'better-auth/plugins'
import db from '#/lib/db'
import * as schema from '#/lib/db/schema'
import { generateUsername } from 'unique-username-generator'
import { eq } from 'drizzle-orm'

const auth = betterAuth({
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

  plugins: [
    anonymous({
      emailDomainName: 'guest.com',
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        console.log('anon', anonymousUser)
        console.log('new', newUser)

        await db
          .update(schema.gameAttempts)
          .set({
            userId: newUser.user.id,
          })
          .where(eq(schema.gameAttempts.userId, anonymousUser.user.id))
      },
      generateName() {
        const createdUserName = generateUsername('-', 0, 20)
        return createdUserName
      },
    }),
    username(),
    tanstackStartCookies(),
  ],
})

export { auth }
