import { useState, useEffect, useCallback } from 'react'
import { loadModel, runInference } from '../lib/inference'
import type { InferenceResult } from '../types'

type Status = 'idle' | 'loading-model' | 'ready' | 'running' | 'done' | 'error'

export function useInference() {
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<InferenceResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setStatus('loading-model')
    loadModel()
      .then(() => setStatus('ready'))
      .catch(err => { setError(err.message); setStatus('error') })
  }, [])

  const analyse = useCallback(
    async (source: HTMLImageElement | HTMLCanvasElement | ImageData) => {
      if (status !== 'ready' && status !== 'done') return
      setStatus('running')
      setResult(null)
      try {
        const r = await runInference(source)
        setResult(r)
        setStatus('done')
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Inference failed')
        setStatus('error')
      }
    },
    [status],
  )

  return { status, result, error, analyse }
}
