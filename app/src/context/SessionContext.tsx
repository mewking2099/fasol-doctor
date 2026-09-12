import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Session } from '../types'

function makeEmpty(): Session {
  return {
    id: crypto.randomUUID(),
    photos: [],
    disease: null,
    timestamp: Date.now(),
    saved: false,
  }
}

interface SessionCtx {
  session: Session
  update: (patch: Partial<Session>) => void
  reset: () => void
}

const Ctx = createContext<SessionCtx | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(makeEmpty)

  const update = useCallback((patch: Partial<Session>) => {
    setSession(s => ({ ...s, ...patch }))
  }, [])

  const reset = useCallback(() => setSession(makeEmpty()), [])

  return <Ctx.Provider value={{ session, update, reset }}>{children}</Ctx.Provider>
}

export function useSession(): SessionCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}
