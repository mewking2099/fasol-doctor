// DS1 — Disease detail (browse from gallery)
import { useNavigate, useParams } from 'react-router-dom'
import { Wheat, ScanLine, ChevronLeft } from 'lucide-react'
import { DISEASE_META } from '../lib/diseaseMeta'
import type { DiseaseClass } from '../types'

const SEV_COLORS: Record<string, string> = {
  'sev-high': '#ef4444',
  'sev-med': '#f59e0b',
  'sev-low': '#22c55e',
}

export default function DS1DiseaseDetail() {
  const nav = useNavigate()
  const { key } = useParams<{ key: string }>()
  const meta = key ? DISEASE_META[key as DiseaseClass] : null

  if (!meta) return (
    <div className="screen flex items-center justify-center">
      <p className="text-ink-400">রোগ পাওয়া যায়নি</p>
    </div>
  )

  const sevColor = SEV_COLORS[meta.sevClass]
  const steps = meta.today.split('। ').filter(Boolean)

  return (
    <div className="screen">
      <div className="topbar">
        <button onClick={() => nav(-1)} className="topbar-back flex items-center gap-1">
          <ChevronLeft size={18} />
          পিছনে
        </button>
        <span className="text-sm font-bold text-ink-900 truncate">{meta.nameBn}</span>
      </div>

      {/* Hero */}
      <div className="flex gap-4 items-start px-5 py-5 bg-white flex-shrink-0" style={{ boxShadow: '0 1px 0 oklch(0.950 0.003 250)' }}>
        <img
          src={meta.imgUrl}
          alt={`${meta.nameBn} রোগের লক্ষণ`}
          className="rounded-xl object-cover flex-shrink-0"
          style={{ width: 72, height: 72 }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-lg font-black text-ink-900">{meta.nameBn}</p>
          <p className="text-xs text-ink-400 mt-1">{meta.en}</p>
          <div className="flex gap-2 mt-2 flex-wrap items-center">
            <span
              className="text-xs font-bold text-white rounded px-2 py-1"
              style={{ background: sevColor }}
            >
              {meta.sevLabel}
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded" style={{ background: '#ecf7f0', color: '#3d8c7a' }}>
              <Wheat size={11} />
              ধান
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 pb-8">

        {/* What */}
        <div className="card p-4">
          <p className="text-sm font-bold text-sage-600 mb-2">এটি কী?</p>
          <p className="text-sm text-ink-600 leading-relaxed">{meta.what}</p>
        </div>

        {/* Do today */}
        <div className="card p-4">
          <p className="text-sm font-bold text-sage-600 mb-4">আজই করুন</p>
          <div className="flex flex-col gap-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="w-7 h-7 min-w-7 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: '#3d8c7a' }}
                >
                  {['১', '২', '৩'][i] ?? i + 1}
                </span>
                <p className="text-sm text-ink-700 leading-relaxed pt-1">{step}।</p>
              </div>
            ))}
          </div>
        </div>

        {/* Prevent */}
        {meta.prevent && (
          <div className="card p-4">
            <p className="text-sm font-bold text-sage-600 mb-2">প্রতিরোধ</p>
            <p className="text-sm text-ink-600 leading-relaxed">{meta.prevent}</p>
          </div>
        )}

        {/* Scan CTA */}
        <button
          className="btn-primary flex items-center justify-center gap-2"
          onClick={() => nav('/camera')}
        >
          <ScanLine size={18} />
          ফসল স্ক্যান করুন
        </button>

      </div>
    </div>
  )
}
