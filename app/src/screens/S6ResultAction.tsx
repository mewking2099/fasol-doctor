// S6 — Result + Action (verdict, steps, pesticide, helpline)
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wheat, Phone, ChevronLeft } from 'lucide-react'
import { useSession } from '../context/SessionContext'
import { DISEASE_META } from '../lib/diseaseMeta'
import { saveScan, makeThumbnail } from '../lib/scanHistory'

const SEV_COLORS: Record<string, string> = {
  'sev-high': '#ef4444',
  'sev-med': '#f59e0b',
  'sev-low': '#22c55e',
}

export default function S6ResultAction() {
  const nav = useNavigate()
  const { session, update } = useSession()

  useEffect(() => {
    const url = session.photos?.[0]
    if (!url) return
    makeThumbnail(url).then(thumbnail =>
      saveScan({ thumbnail, disease: session.disease, timestamp: Date.now() })
    )
  }, [])

  const disease = session.disease
  if (!disease) { nav('/no-match', { replace: true }); return null }

  const meta = DISEASE_META[disease]
  const sevColor = SEV_COLORS[meta.sevClass]
  const steps = meta.today.split('। ').filter(Boolean)

  return (
    <div className="screen">
      <div className="topbar">
        <button onClick={() => nav('/camera')} className="topbar-back flex items-center gap-1">
          <ChevronLeft size={18} />
          পিছনে
        </button>
        <span className="text-sm font-bold text-ink-900">রোগ শনাক্ত হয়েছে</span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 pb-8">

        {/* VERDICT HERO */}
        <div
          className="rounded-2xl p-5 flex gap-4 items-start"
          style={{ background: 'linear-gradient(135deg,#fde8e8,#fff5f5)', boxShadow: '0 4px 20px rgba(239,68,68,.1)' }}
        >
          <img
            src={meta.imgUrl}
            alt={`${meta.nameBn} রোগের লক্ষণ`}
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-black text-ink-900 leading-tight">{meta.nameBn}</p>
            <p className="text-xs text-ink-400 mt-1">{meta.en}</p>
            <div className="flex gap-2 mt-3 flex-wrap items-center">
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

        {/* WHAT IS IT */}
        <div className="card p-4">
          <p className="text-sm font-bold text-sage-600 mb-2">এটি কী?</p>
          <p className="text-sm text-ink-600 leading-relaxed">{meta.what}</p>
        </div>

        {/* DO NOW */}
        <div className="card p-4">
          <p className="text-sm font-bold text-sage-600 mb-4">এখনই করুন</p>
          <div className="flex flex-col gap-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="w-9 h-9 min-w-9 rounded-full flex items-center justify-center text-white text-base font-black flex-shrink-0"
                  style={{ background: '#3d8c7a', boxShadow: '0 2px 6px rgba(61,140,122,.35)' }}
                >
                  {['১', '২', '৩'][i] ?? i + 1}
                </span>
                <p className="text-base text-ink-700 leading-relaxed pt-1">{step}।</p>
              </div>
            ))}
          </div>
        </div>

        {/* PESTICIDE */}
        {meta.pesticide && (
          <div
            className="rounded-2xl p-4"
            style={{ background: '#fffbf0', border: '1.5px solid rgba(234,179,8,.3)' }}
          >
            <p className="text-sm font-bold mb-3" style={{ color: '#92710b' }}>ওষুধ</p>
            <p className="text-lg font-black text-ink-900">{meta.pesticide.name}</p>
            <div className="mt-3 flex flex-col gap-2">
              {[
                { label: 'মাত্রা', value: meta.pesticide.dose },
                { label: 'কোথায়', value: meta.pesticide.where },
              ].map(r => (
                <div key={r.label} className="flex gap-3">
                  <p className="text-xs text-ink-400 w-14 flex-shrink-0 pt-0.5">{r.label}</p>
                  <p className="text-sm font-semibold text-ink-700">{r.value}</p>
                </div>
              ))}
              <div className="flex gap-3">
                <p className="text-xs text-ink-400 w-14 flex-shrink-0 pt-0.5">সতর্কতা</p>
                <p className="text-sm font-semibold" style={{ color: '#e05252' }}>{meta.pesticide.warning}</p>
              </div>
            </div>
          </div>
        )}

        {/* HELPLINE */}
        <a
          href="tel:16123"
          className="card p-4 flex items-center gap-4 no-underline"
          style={{ minHeight: 64 }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#dcf5ec' }}>
            <Phone size={22} style={{ color: '#3d8c7a' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-black text-ink-900">কৃষি হেল্পলাইন</p>
            <p className="text-xs text-ink-400 mt-0.5">বিশেষজ্ঞ পরামর্শ · বিনামূল্যে · যেকোনো মোবাইল থেকে</p>
          </div>
          <span className="text-xl font-black flex-shrink-0" style={{ color: '#3d8c7a' }}>16123</span>
        </a>

        {/* SAVE */}
        <button
          className="btn-primary"
          onClick={() => {
            update({ saved: true })
            nav('/saved')
          }}
        >
          রিপোর্ট সেভ করুন
        </button>

      </div>
    </div>
  )
}
