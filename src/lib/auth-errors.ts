type TAuthField = 'email' | 'password' | 'confirmPassword' | 'username'

type TAuthFailure = {
  field: TAuthField | null
  message: string
}

type TAuthErrorLike = {
  code?: string
  message?: string
  status?: number
  statusText?: string
}

const GENERIC_MESSAGE = 'Something went wrong. Please try again.'
const NETWORK_MESSAGE =
  "Couldn't reach the server. Check your connection and try again."

const CODE_MAP: Record<string, TAuthFailure> = {
  // Sign in
  INVALID_EMAIL_OR_PASSWORD: {
    field: 'password',
    message: "That email and password don't match an account.",
  },
  INVALID_USERNAME_OR_PASSWORD: {
    field: 'password',
    message: "That username and password don't match an account.",
  },
  USER_NOT_FOUND: {
    field: 'email',
    message: 'No account uses that email.',
  },
  CREDENTIAL_ACCOUNT_NOT_FOUND: {
    field: 'email',
    message: 'That account has no password set. Try another sign in method.',
  },
  EMAIL_NOT_VERIFIED: {
    field: null,
    message: 'Verify your email address before signing in.',
  },
  SESSION_EXPIRED: {
    field: null,
    message: 'Your session expired. Sign in again.',
  },

  // Sign up
  USER_ALREADY_EXISTS: {
    field: 'email',
    message: 'An account already uses that email.',
  },
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: {
    field: 'email',
    message: 'An account already uses that email.',
  },
  USERNAME_IS_ALREADY_TAKEN: {
    field: 'username',
    message: 'That username is taken. Try another.',
  },
  USERNAME_TOO_SHORT: {
    field: 'username',
    message: 'That username is too short.',
  },
  USERNAME_TOO_LONG: {
    field: 'username',
    message: 'That username is too long.',
  },
  INVALID_USERNAME: {
    field: 'username',
    message: 'Usernames can only use letters, numbers, and underscores.',
  },
  INVALID_DISPLAY_USERNAME: {
    field: 'username',
    message: 'That username uses characters we cannot display.',
  },
  FAILED_TO_CREATE_USER: {
    field: null,
    message: "We couldn't create your account. Try again in a moment.",
  },
  FAILED_TO_CREATE_SESSION: {
    field: null,
    message:
      'Your account was created but we could not sign you in. Try signing in.',
  },

  // Shared field validation
  INVALID_EMAIL: {
    field: 'email',
    message: 'That email address is not valid.',
  },
  INVALID_PASSWORD: {
    field: 'password',
    message: 'That password is not valid.',
  },
  PASSWORD_TOO_SHORT: {
    field: 'password',
    message: 'That password is too short.',
  },
  PASSWORD_TOO_LONG: {
    field: 'password',
    message: 'That password is too long.',
  },
}

const authFailure = (
  error: TAuthErrorLike | null | undefined,
): TAuthFailure => {
  const mapped = error?.code ? CODE_MAP[error.code] : undefined
  if (mapped) {
    return mapped
  }

  if (error?.status === 429) {
    return {
      field: null,
      message: 'Too many attempts. Wait a moment and try again.',
    }
  }

  if (error?.status && error.status >= 500) {
    return { field: null, message: GENERIC_MESSAGE }
  }

  return { field: null, message: error?.message || GENERIC_MESSAGE }
}

const thrownFailure = (error: unknown): TAuthFailure => {
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false
  if (offline || error instanceof TypeError) {
    return { field: null, message: NETWORK_MESSAGE }
  }

  return { field: null, message: GENERIC_MESSAGE }
}

export { authFailure, thrownFailure, GENERIC_MESSAGE, NETWORK_MESSAGE }
export type { TAuthFailure, TAuthField, TAuthErrorLike }
