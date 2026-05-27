import { api } from '@/lib/api/client'

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload {
  email: string; password: string; first_name: string; last_name: string
  role: 'talent' | 'employer' | 'trainer'
}
export interface FirebaseAuthPayload { id_token: string; role?: 'talent' | 'employer' | 'trainer' }
export interface AuthResponse {
  access_token: string; token_type: string
  user: { id: number; email: string; first_name: string; last_name: string; role: string; is_verified: boolean }
}

export const authEndpoints = {
  login:   (body: LoginPayload)        => api.post('auth/login',    { json: body }).json<AuthResponse>(),
  register:(body: RegisterPayload)     => api.post('auth/register',  { json: body }).json<AuthResponse>(),
  firebase:(body: FirebaseAuthPayload) => api.post('auth/firebase',  { json: body }).json<AuthResponse>(),
  logout:  ()                          => api.post('auth/logout').json<void>(),
  forgotPassword: (email: string)      => api.post('auth/forgot-password', { searchParams: { email } }).json<void>(),
  resetPassword:  (token: string, password: string) =>
    api.post('auth/reset-password', { json: { token, new_password: password } }).json<void>(),
  resendVerification: (email: string)  => api.post('auth/resend-verification', { searchParams: { email } }).json<void>(),
  verifyEmail:        (token: string)   => api.post('auth/verify-email',        { searchParams: { token } }).json<AuthResponse>(),
}
