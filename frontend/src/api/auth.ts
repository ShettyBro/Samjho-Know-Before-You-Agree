import { apiRequest, type ApiOutcome } from './client.js'
import type { PublicUser } from './types.js'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isUserResponse(value: unknown): value is { user: PublicUser } {
  return isRecord(value) && isRecord(value.user) && typeof value.user.id === 'string' && typeof value.user.email === 'string'
}

export async function registerAccount(email: string, password: string): Promise<ApiOutcome<{ user: PublicUser }>> {
  return apiRequest(
    '/api/v1/auth/register',
    { method: 'POST', body: JSON.stringify({ email, password }) },
    isUserResponse,
  )
}

export async function loginAccount(email: string, password: string): Promise<ApiOutcome<{ user: PublicUser }>> {
  return apiRequest('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, isUserResponse)
}

export async function logoutAccount(): Promise<void> {
  await apiRequest('/api/v1/auth/logout', { method: 'POST' }, (value): value is { ok: boolean } => isRecord(value))
}

export async function fetchCurrentUser(): Promise<ApiOutcome<{ user: PublicUser }>> {
  return apiRequest('/api/v1/auth/me', { method: 'GET' }, isUserResponse)
}
