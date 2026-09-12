// CG — Camera: multi-shot verification (up to 3 images, majority-vote result)
import { useRef, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'
import { Images, ScanLine, CheckCircle, RefreshCw } from 'lucide-react'
import { useInference } from '../hooks/useInference'
import { useSession } from '../context/SessionContext'
import { play } from '../lib/audio'
import type { InferenceResult } from '../types'

const MAX_SHOTS = 3
const HIGH_CONFIDENCE = 0.75  // navigate immediately, but still offer "one more"

interface Shot {
  url: string
  result: InferenceResult
}

function aggregateShots(shots: Shot[]) {
  const valid = shots.filter(
    s => s.result.topClass !== 'not_rice_leaf' && !s.result.isUnclear
  )
  if (valid.length === 0) return { disease: null, photo: shots[0]?.url ?? null }

  // Vote: pick most frequent class, break ties by confidence
  const tally: Record<string, number> = {}
  for (const s of valid) {
    tally[s.result.topClass] = (tally[s.result.topClass] ?? 0) + s.result.confidence
  }
  const winner = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0]
  const bestShot = valid.filter(s => s.result.topClass === winner)
    .sort((a, b) => b.result.confidence - a.result.confidence)[0]

  return { disease: winner as import('../types').DiseaseClass, photo: bestShot.url }
}

export default function CGCamera() {
  const nav = useNavigate()
  const { update, reset } = useSession()
  const { status, result, analyse } = useInference()

  const fileRef    = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const launched   = useRef(false)
  const prevResult = useRef<InferenceResult | null>(null)

  const [shots, setShots]           = useState<Shot[]>([])
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null)
  const [phase, setPhase]           = useState<'idle' | 'analysing' | 'reviewing'>('idle')

  const modelReady = status === 'ready' || status === 'done'
  const isNative   = Capacitor.isNativePlatform()
  const shotCount  = shots.length
  const lastShot   = shots[shots.length - 1] ?? null

  // ── navigate to result ──────────────────────────────────────────────────
  const finish = useCallback((finishShots: Shot[]) => {
    const { disease, photo } = aggregateShots(finishShots)
    reset()
    update({ photos: photo ? [photo] : [], disease })
    nav(disease ? '/result' : '/no-match', { replace: true })
  }, [nav, reset, update])

  // ── detect when a new inference result arrives ───────────────────────
  useEffect(() => {
    if (!result || result === prevResult.current || phase !== 'analysing') return
    prevResult.current = result
    if (!currentPhoto) return

    const shot: Shot = { url: currentPhoto, result }
    const nextShots = [...shots, shot]
    setShots(nextShots)

    const highConf = result.topClass !== 'not_rice_leaf' && result.confidence >= HIGH_CONFIDENCE
    if (highConf || nextShots.length >= MAX_SHOTS) {
      // High confidence or max shots reached → navigate immediately
      finish(nextShots)
    } else {
      // Show reviewing UI so user can decide
      setPhase('reviewing')
    }
  }, [result])

  // ── process a photo URL ───────────────────────────────────────────────
  async function processPhoto(url: string) {
    setCurrentPhoto(url)
    setPhase('analysing')
    play('cam.ready')
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => analyse(img)
    img.onerror = () => nav('/', { replace: true })
    img.src = url
  }

  // ── open native camera ────────────────────────────────────────────────
  async function openCamera() {
    try {
      const p = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      })
      if (p.webPath) await processPhoto(p.webPath)
      else if (shots.length === 0) nav('/', { replace: true })
    } catch {
      if (shots.length === 0) nav('/', { replace: true })
    }
  }

  async function openGalleryNative() {
    try {
      const p = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      })
      if (p.webPath) await processPhoto(p.webPath)
    } catch {}
  }

  function onWebFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    void processPhoto(URL.createObjectURL(file))
  }

  // ── auto-launch on native ─────────────────────────────────────────────
  useEffect(() => {
    if (!isNative || !modelReady || launched.current) return
    launched.current = true
    void openCamera()
  }, [modelReady])

  // ── confidence indicator helpers ──────────────────────────────────────
  const confPct   = lastShot ? Math.round(lastShot.result.confidence * 100) : 0
  const isUnclear = lastShot ? (lastShot.result.topClass === 'not_rice_leaf' || lastShot.result.isUnclear) : false
  const confColor = confPct >= 75 ? '#22c55e' : confPct >= 55 ? '#f59e0b' : '#ef4444'

  // ── REVIEWING STATE ───────────────────────────────────────────────────
  if (phase === 'reviewing' && lastShot) {
    return (
      <div className="flex flex-col min-h-dvh bg-ink-900 p-5 gap-5">

        {/* Shot counter */}
        <div className="flex items-center justify-between pt-4">
          <p className="text-white/60 text-xs font-semibold">
            {shotCount}/{MAX_SHOTS} ছবি বিশ্লেষণ হয়েছে
          </p>
          <div className="flex gap-1.5">
            {Array.from({ length: MAX_SHOTS }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: i < shotCount ? '#3d8c7a' : 'rgba(255,255,255,.2)' }}
              />
            ))}
          </div>
        </div>

        {/* Latest shot thumbnail */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <img
              src={lastShot.url}
              alt=""
              className="w-48 h-48 rounded-2xl object-cover"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,.5)' }}
            />
            <div
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: isUnclear ? '#ef4444' : confColor, boxShadow: '0 2px 8px rgba(0,0,0,.4)' }}
            >
              {isUnclear
                ? <RefreshCw size={18} className="text-white" />
                : <CheckCircle size={18} className="text-white" />
              }
            </div>
          </div>

          {/* Confidence readout */}
          <div className="text-center">
            {isUnclear ? (
              <>
                <p className="text-white font-bold text-lg">ছবি স্পষ্ট হয়নি</p>
                <p className="text-white/50 text-sm mt-1">পাতার কাছে গিয়ে আরেকটা তুলুন</p>
              </>
            ) : (
              <>
                <p className="text-white font-bold text-lg">
                  {lastShot.result.topClass === 'healthy' ? 'সুস্থ ধান' : 'রোগ শনাক্ত হয়েছে'}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="w-32 h-2 rounded-full bg-white/15">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${confPct}%`, background: confColor }}
                    />
                  </div>
                  <span className="text-xs font-bold" style={{ color: confColor }}>
                    {confPct}% নিশ্চিত
                  </span>
                </div>
                {confPct < 75 && (
                  <p className="text-white/50 text-xs mt-2">আরেকটা ছবি তুললে নির্ভুলতা বাড়বে</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 pb-4">
          {shotCount < MAX_SHOTS && (
            <button
              onClick={() => {
                setPhase('idle')
                isNative ? void openCamera() : fileRef.current?.click()
              }}
              className="flex items-center justify-center gap-2 w-full rounded-xl font-bold text-white py-4"
              style={{
                background: isUnclear ? '#3d8c7a' : 'rgba(255,255,255,.12)',
                minHeight: 56,
                fontSize: 15,
                border: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <ScanLine size={18} />
              আরেকটা ছবি তুলুন ({shotCount + 1}/{MAX_SHOTS})
            </button>
          )}
          {!isUnclear && (
            <button
              onClick={() => finish(shots)}
              className="flex items-center justify-center gap-2 w-full rounded-xl font-bold py-4"
              style={{
                background: '#3d8c7a',
                color: 'white',
                minHeight: 56,
                fontSize: 15,
                border: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <CheckCircle size={18} />
              ফলাফল দেখুন
            </button>
          )}
          {isUnclear && shotCount >= MAX_SHOTS && (
            <button
              onClick={() => nav('/', { replace: true })}
              className="flex items-center justify-center gap-2 w-full rounded-xl font-bold py-4"
              style={{
                background: 'rgba(255,255,255,.12)',
                color: 'rgba(255,255,255,.7)',
                minHeight: 56,
                fontSize: 15,
                border: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              হোমে ফিরে যান
            </button>
          )}
        </div>

        {/* Web-only hidden input for "another photo" */}
        {!isNative && (
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onWebFile} />
        )}
      </div>
    )
  }

  // ── ANALYSING STATE ───────────────────────────────────────────────────
  if (phase === 'analysing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-ink-900 gap-5 p-8">
        {currentPhoto && (
          <img
            src={currentPhoto}
            alt=""
            className="w-32 h-32 rounded-2xl object-cover"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,.45)' }}
          />
        )}
        <div
          className="spinner-ring w-10 h-10 rounded-full border-2 border-white/20"
          style={{ borderTopColor: '#3d8c7a', animation: 'spin .8s linear infinite' }}
          role="status"
          aria-label="বিশ্লেষণ হচ্ছে"
        />
        <p className="text-white/60 text-sm">রোগ শনাক্ত করছি…</p>
      </div>
    )
  }

  // ── IDLE / LOADING STATE ──────────────────────────────────────────────
  if (isNative) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-ink-900 gap-6 p-8">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,.08)' }}
        >
          <ScanLine size={36} className="text-white/50" />
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-lg">
            {modelReady ? 'ক্যামেরা খুলছে…' : 'AI প্রস্তুত হচ্ছে…'}
          </p>
          <p className="text-white/40 text-sm mt-1">পাতার ছবি তুলুন</p>
        </div>
        {modelReady && (
          <button
            onClick={openGalleryNative}
            className="flex items-center gap-2 px-5 py-3 rounded-xl"
            style={{
              background: 'rgba(255,255,255,.10)',
              color: 'rgba(255,255,255,.70)',
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              minHeight: 48,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Images size={18} />
            গ্যালারি থেকে বেছে নিন
          </button>
        )}
      </div>
    )
  }

  // Web fallback
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-ink-900 gap-5 p-8 w-full max-w-xs mx-auto">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,.08)' }}
      >
        <ScanLine size={36} className="text-white/50" />
      </div>
      <p className="text-white font-bold text-lg text-center">পাতার ছবি দিন</p>
      <button
        onClick={() => fileRef.current?.click()}
        disabled={!modelReady}
        className="btn-primary"
      >
        {modelReady ? 'ক্যামেরা থেকে তুলুন' : 'AI লোড হচ্ছে…'}
      </button>
      <button
        onClick={() => galleryRef.current?.click()}
        disabled={!modelReady}
        className="btn-ghost flex items-center gap-2"
      >
        <Images size={18} />
        গ্যালারি থেকে বেছে নিন
      </button>
      <input ref={fileRef}    type="file" accept="image/*" capture="environment" className="hidden" onChange={onWebFile} />
      <input ref={galleryRef} type="file" accept="image/*"                        className="hidden" onChange={onWebFile} />
    </div>
  )
}
