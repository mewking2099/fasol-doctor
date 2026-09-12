import { useEffect, useCallback } from 'react'
import { play, stop } from '../lib/audio'

// Auto-plays a clip when the screen mounts; cleans up on unmount.
export function useAudio(key: string) {
  useEffect(() => {
    play(key)
    return () => stop()
  }, [key])

  const replay = useCallback(() => play(key), [key])
  return { replay }
}
