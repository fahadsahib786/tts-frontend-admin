export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'user'
  isEmailVerified: boolean
  createdAt: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface ApiError {
  message: string
  status: number
}
