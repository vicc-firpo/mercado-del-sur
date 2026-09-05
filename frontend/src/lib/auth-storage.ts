import type { AuthResponse, User } from '@/types/auth/auth-response'

const TOKEN_KEY = 'mds.token'
const USER_KEY = 'mds.user'

export interface StoredAuth {
  token: string | null
  user: User | null
}

export function readAuth(): StoredAuth {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const rawUser = localStorage.getItem(USER_KEY)
    return {
      token,
      user: rawUser ? (JSON.parse(rawUser) as User) : null,
    }
  } catch {
    return { token: null, user: null }
  }
}

export function writeAuth({ accessToken, user }: AuthResponse): void {
  try {
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch {
    /* storage unavailable — session stays in memory only */
  }
}

export function eraseAuth(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {
    /* no-op */
  }
}
