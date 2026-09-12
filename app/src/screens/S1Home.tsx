// S1 — Home
import { useNavigate } from 'react-router-dom'
import { play } from '../lib/audio'
import { DISEASE_META } from '../lib/diseaseMeta'
import type { DiseaseClass } from '../types'
import {
  ClipboardList, ScanLine, Wheat, TriangleAlert,
  Droplets, Wind, Thermometer, Users, Phone, ChevronRight,
  WifiOff, Lightbulb,
} from 'lucide-react'
import { useWeather } from '../hooks/useWeather'

const GALLERY_KEYS: DiseaseClass[] = ['leaf_blast', 'bacterial_leaf_blight', 'brown_spot', 'tungro']

const OFFLINE_TIPS = [
  'সপ্তাহে একবার ফসল পরীক্ষা করুন — রোগ আগে ধরলে চিকিৎসা সহজ',
  'মাঠে অতিরিক্ত পানি দাঁড়ালে দ্রুত নিকাশ করুন',
  'আক্রান্ত পাতা তুলে মাঠের বাইরে ফেলুন — রোগ ছড়ায় না',
  'রোদের আলোতে ছবি তুলুন — AI আরো নির্ভুল শনাক্ত করবে',
]

const RISK_COLORS = {
  high: { bg: '#ef4444', label: 'রোগের ঝুঁকি' },
  medium: { bg: '#f59e0b', label: 'মাঝারি ঝুঁকি' },
  low: { bg: '#22c55e', label: 'কম ঝুঁকি' },
}

export default function S1Home() {
  const nav = useNavigate()
  const { weather, offline } = useWeather()

  const tipIdx = new Date().getDate() % OFFLINE_TIPS.length

  return (
    <div className="screen">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6 pb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-black text-ink-900">Fasol Doctor</h1>
          <p className="text-xs text-ink-400 mt-0.5">ধানের রোগ নির্ণয় — বিনামূল্যে</p>
        </div>
        <button
          onClick={() => nav('/saved')}
          className="p-3 rounded-xl bg-white shadow-sm flex items-center justify-center"
          aria-label="সংরক্ষিত রিপোর্ট"
          style={{ minWidth: 48, minHeight: 48 }}
        >
          <ClipboardList size={20} className="text-ink-600" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-4 pb-8">

        {/* Weather card — show if data available; tips card if offline */}
        {weather ? (
          <div
            className="rounded-2xl overflow-hidden flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2d7a6a 0%, #3d8c7a 60%, #4aa08e 100%)', minHeight: 100 }}
          >
            <div className="p-4 flex items-start justify-between">
              <div>
                <p className="text-xs text-white/70 font-semibold">{weather.conditionBn}</p>
                <p className="text-4xl font-black text-white leading-none mt-1">{weather.tempC}°C</p>
              </div>
              <span
                className="text-xs font-bold text-white px-2 py-1 rounded"
                style={{ background: RISK_COLORS[weather.riskLevel].bg }}
              >
                {weather.riskLabelBn}
              </span>
            </div>
            <div className="px-4 pb-3 flex gap-4 text-xs text-white/70">
              <span className="flex items-center gap-1"><Droplets size={12} /> আর্দ্রতা {weather.humidity}%</span>
              <span className="flex items-center gap-1"><Wind size={12} /> {weather.windKmh} km/h</span>
              <span className="flex items-center gap-1"><Thermometer size={12} /> অনুভূতি {weather.tempC + 2}°</span>
            </div>
          </div>
        ) : offline ? (
          <div
            className="rounded-2xl p-4 flex gap-3 items-start flex-shrink-0"
            style={{ background: '#f8f6f2', border: '1.5px solid #e8e3db' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#ecf7f0' }}
            >
              <Lightbulb size={20} style={{ color: '#3d8c7a' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-bold text-ink-700">আজকের টিপস</p>
                <WifiOff size={11} className="text-ink-300" />
              </div>
              <p className="text-sm text-ink-600 leading-relaxed">{OFFLINE_TIPS[tipIdx]}</p>
            </div>
          </div>
        ) : null}

        {/* Area alert */}
        <div
          className="rounded-2xl p-4 flex gap-3 items-start flex-shrink-0"
          style={{ background: '#fffbf0', border: '1.5px solid rgba(245,158,11,.25)' }}
        >
          <TriangleAlert size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#b45309' }} />
          <div>
            <p className="text-xs font-bold text-amber-700">এলাকার সতর্কতা</p>
            <p className="text-xs text-ink-600 mt-0.5 leading-relaxed">
              সিলেট বিভাগে পাতা ঝলসানো রোগের প্রকোপ রিপোর্ট হয়েছে। নিকটবর্তী উপজেলায় সতর্ক থাকুন।
            </p>
          </div>
        </div>

        {/* Scan CTA */}
        <button
          onClick={() => { play('home.b1'); nav('/camera') }}
          className="flex items-center gap-4 rounded-2xl px-5 py-5 w-full text-left active:scale-[.98] transition-transform flex-shrink-0"
          style={{ background: '#3d8c7a', boxShadow: '0 4px 16px rgba(61,140,122,.3)' }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,.15)' }}
          >
            <ScanLine size={32} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-black text-white leading-tight">ফসল স্ক্যান করুন</p>
            <p className="text-xs text-white/70 mt-1">ক্যামেরায় পাতা ধরুন — AI রোগ শনাক্ত করবে</p>
          </div>
          <ChevronRight size={20} className="text-white/50 flex-shrink-0" />
        </button>

        {/* Disease gallery */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-ink-700">সাধারণ রোগ ও সমাধান</p>
            <p className="text-xs text-ink-400">ছবিতে, সমাধান সহ</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {GALLERY_KEYS.map(key => {
              const m = DISEASE_META[key]
              return (
                <button
                  key={key}
                  onClick={() => nav(`/disease/${key}`)}
                  className="flex-shrink-0 rounded-xl overflow-hidden bg-white text-left active:scale-[.97] transition-transform"
                  style={{ width: 120, boxShadow: '0 2px 6px rgba(0,0,0,.07)' }}
                >
                  <img
                    src={m.imgUrl}
                    alt={`${m.nameBn} রোগের লক্ষণ`}
                    loading="lazy"
                    className="w-full object-cover"
                    style={{ height: 68 }}
                  />
                  <div className="p-2">
                    <p className="text-xs font-bold text-ink-800 leading-tight">{m.nameBn}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Wheat size={11} style={{ color: '#3d8c7a' }} />
                      <span className="text-xs" style={{ color: '#3d8c7a' }}>ধান</span>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: m.sevClass === 'sev-high' ? '#ef4444' : '#f59e0b' }}
                      >
                        · {m.sevLabel}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Krishi directory row */}
        <button
          onClick={() => nav('/directory')}
          className="flex items-center gap-3 bg-white rounded-2xl px-4 py-4 w-full text-left active:scale-[.98] transition-transform flex-shrink-0"
          style={{ border: '1.5px solid oklch(0.890 0.005 250)', minHeight: 64 }}
        >
          <div className="w-10 h-10 rounded-xl bg-sage-50 flex items-center justify-center flex-shrink-0">
            <Users size={20} style={{ color: '#3d8c7a' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-ink-800">কৃষি কর্মকর্তা</p>
            <p className="text-xs text-ink-400 mt-0.5">আপনার এলাকার বিশেষজ্ঞ</p>
          </div>
          <ChevronRight size={18} className="text-ink-300 flex-shrink-0" />
        </button>

        {/* Helpline */}
        <a
          href="tel:16123"
          className="flex items-center gap-3 bg-white rounded-2xl px-4 py-4 no-underline flex-shrink-0"
          style={{ border: '1.5px solid oklch(0.890 0.005 250)', minHeight: 64 }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#dcf5ec' }}>
            <Phone size={20} style={{ color: '#3d8c7a' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-ink-800">কৃষি হেল্পলাইন</p>
            <p className="text-xs text-ink-400 mt-0.5">বিনামূল্যে পরামর্শ</p>
          </div>
          <span className="text-lg font-black flex-shrink-0" style={{ color: '#3d8c7a' }}>16123</span>
        </a>

      </div>
    </div>
  )
}
