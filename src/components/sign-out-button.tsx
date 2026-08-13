import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'

import { authClient } from '#/lib/auth/client'

export function SignOutButton() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await authClient.signOut()
    await router.navigate({ to: '/' })
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="border-lm-line text-lm-paper hover:border-lm-amber hover:bg-lm-amber/10 focus-visible:outline-lm-amber rounded-full border px-4 py-2 text-sm outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
    >
      {isSigningOut ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
