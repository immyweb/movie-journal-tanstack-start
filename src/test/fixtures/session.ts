import type { getSession } from '#/lib/auth/functions'

type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>

export const fakeUser: Session['user'] = {
  id: 'user_1',
  name: 'Riley Chen',
  email: 'riley@example.com',
  emailVerified: true,
  image: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

export const fakeSession: Session = {
  user: fakeUser,
  session: {
    id: 'session_1',
    token: 'fake-session-token',
    userId: fakeUser.id,
    expiresAt: new Date('2099-01-01T00:00:00Z'),
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ipAddress: null,
    userAgent: null,
  },
}
