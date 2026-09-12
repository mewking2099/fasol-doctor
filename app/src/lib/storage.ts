import { openDB, type DBSchema } from 'idb'
import type { Session } from '../types'

interface FasolDB extends DBSchema {
  sessions: { key: string; value: Session; indexes: { 'by-timestamp': number } }
}

const dbPromise = openDB<FasolDB>('fasol-doctor', 1, {
  upgrade(db) {
    const sessions = db.createObjectStore('sessions', { keyPath: 'id' })
    sessions.createIndex('by-timestamp', 'timestamp')
  },
})

export async function saveSession(session: Session): Promise<void> {
  const db = await dbPromise
  await db.put('sessions', session)
}

export async function getSavedSessions(): Promise<Session[]> {
  const db = await dbPromise
  const all = await db.getAllFromIndex('sessions', 'by-timestamp')
  return all.filter(s => s.saved).reverse()
}
