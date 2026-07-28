import { createAuthClient } from 'better-auth/react'
import { usernameClient, anonymousClient } from 'better-auth/client/plugins'

export const { signIn, signUp, useSession, signOut, getSession } =
  createAuthClient({
    plugins: [anonymousClient(), usernameClient()],
  })
