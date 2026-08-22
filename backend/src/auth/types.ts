export type User = {
  id: string
  email: string
  passwordHash: string
  createdAt: string
  updatedAt: string
}

export type PublicUser = {
  id: string
  email: string
  createdAt: string
}

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, email: user.email, createdAt: user.createdAt }
}
