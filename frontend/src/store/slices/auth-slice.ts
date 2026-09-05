import { eraseAuth, readAuth, writeAuth } from '@/lib/auth-storage'
import type { AuthResponse, User } from '@/types/auth/auth-response'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  token: string | null
  user: User | null
}

const initialState: AuthState = readAuth()

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<AuthResponse>) => {
      state.token = action.payload.accessToken
      state.user = action.payload.user
      writeAuth(action.payload)
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      if (state.token) {
        writeAuth({ accessToken: state.token, user: action.payload })
      }
    },
    clearAuth: (state) => {
      state.token = null
      state.user = null
      eraseAuth()
    },
  },
})

export const { setAuth, setUser, clearAuth } = authSlice.actions
export const authReducer = authSlice.reducer
