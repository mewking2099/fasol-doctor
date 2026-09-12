// GL1 — Disease encyclopedia: rice (live) + other crops (coming soon)
import { useNavigate } from 'react-router-dom'
import { BookOpen, Lock } from 'lucide-react'
import { DISEASE_META } from '../lib/diseaseMeta'
import type { DiseaseClass } from '../types'

const RICE_DISEASES: DiseaseClass[] = ['leaf_blast', 'bacterial_leaf_blight', 'brown_spot', 'tungro']

interface ComingSoonCrop {
  nameBn: string
  nameEn: string
  imgUrl: string
  diseaseCount: number
}

const COMING_SOON: ComingSoonCrop[] = [
  {
    nameBn: 'গম',
    nameEn: 'Wheat',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Wheat-Basalt_1MB.jpg/480px-Wheat-Basalt_1MB.jpg',
    diseaseCount: 8,
  },
  {
    nameBn: 'পাট',
    nameEn: 'Jute',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Jute_field_in_Bangladesh.jpg/480px-Jute_field_in_Bangladesh.jpg',
    diseaseCount: 5,
  },
  {
    nameBn: 'আলু',
    nameEn: 'Potato',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Potato_plant.jpg/480px-Potato_plant.jpg',
    diseaseCount: 10,
  },
  {
    nameBn: 'সরিষা',
    nameEn: 'Mustard',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Brassica_rapa_subsp_rapa.jpg/480px-Brassica_rapa_subsp_rapa.jpg',
    diseaseCount: 6,
  },
  {
    nameBn: 'ভুট্টা',
    nameEn: 'Maize',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Corncobs_20060605_01.jpg/480px-Corncobs_20060605_01.jpg',
    diseaseCount: 7,
  },
]

const SEV_COLORS: Record<string, { bg: string; text: string }> = {
  'sev-high': { bg: '#fef2f2', text: '#ef4444' },
  'sev-med':  { bg: '#fffbeb', text: '#f59e0b' },
  'sev-low':  { bg: '#f0fdf4', text: '#22c55e' },
}

export default function GalleryScreen() {
  const nav = useNavigate()

  return (
    <div className="screen">
      <div className="topbar">
        <BookOpen size={18} className="text-ink-700" />
        <span className="text-base font-black text-ink-900">রোগের তথ্যভাণ্ডার</span>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">

        {/* ── Rice section ─────────────────────────────────────────────── */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: '#ecf7f0', color: '#3d8c7a' }}
            >
              ধান — Rice
            </span>
            <span className="text-xs text-ink-400">{RICE_DISEASES.length}টি রোগ</span>
          </div>

          <div className="flex flex-col gap-3">
            {RICE_DISEASES.map(key => {
              const m = DISEASE_META[key]
              const sev = SEV_COLORS[m.sevClass]
              return (
                <button
                  key={key}
                  onClick={() => nav(`/disease/${key}`)}
                  className="flex items-start gap-4 bg-white rounded-2xl p-4 text-left w-full active:scale-[.98] transition-transform"
                  style={{ boxShadow: '0 2px 10px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04)' }}
                >
                  <img
                    src={m.imgUrl}
                    alt={`${m.nameBn} রোগের লক্ষণ`}
                    loading="lazy"
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black text-ink-900 leading-snug">{m.nameBn}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{m.en}</p>
                    <p className="text-xs text-ink-500 leading-relaxed mt-2 line-clamp-2">{m.what}</p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: sev.bg, color: sev.text }}
                      >
                        {m.sevLabel}
                      </span>
                      {m.pesticide && (
                        <span className="text-xs text-ink-400 font-medium">
                          ওষুধ: {m.pesticide.name.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Coming soon ──────────────────────────────────────────────── */}
        <div className="px-4 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: '#f3f0eb', color: '#7c6a52' }}
            >
              শীঘ্রই আসছে
            </span>
            <span className="text-xs text-ink-400">{COMING_SOON.length}টি ফসল</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {COMING_SOON.map(crop => (
              <div
                key={crop.nameEn}
                className="relative rounded-2xl overflow-hidden bg-white"
                style={{ border: '1.5px solid oklch(0.890 0.005 250)' }}
              >
                <div className="relative">
                  <img
                    src={crop.imgUrl}
                    alt={crop.nameBn}
                    loading="lazy"
                    className="w-full object-cover"
                    style={{ height: 96, filter: 'grayscale(0.5) brightness(0.7)' }}
                    onError={e => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <div
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,.5)' }}
                  >
                    <Lock size={13} className="text-white" />
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-black text-ink-900">{crop.nameBn}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{crop.nameEn}</p>
                  <p className="text-xs font-semibold mt-2" style={{ color: '#b45309' }}>
                    {crop.diseaseCount}টি রোগ · শীঘ্রই
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
