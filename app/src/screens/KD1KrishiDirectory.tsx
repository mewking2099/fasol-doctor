// KD1 — Krishi officer directory
import { useState, useMemo } from 'react'
import { Phone, Microscope, Leaf, Landmark, Search, X } from 'lucide-react'
import { DAE_OFFICERS } from '../lib/daeOfficers'

interface Institution {
  nameBn: string
  nameEn: string
  role: string
  phone: string
  iconBg: string
  iconColor: string
  Icon: React.ElementType
}

const INSTITUTIONS: Institution[] = [
  {
    nameBn: 'বাংলাদেশ ধান গবেষণা ইনস্টিটিউট',
    nameEn: 'BRRI',
    role: 'জয়দেবপুর, গাজীপুর-১৭০১',
    phone: '02-49272005',
    Icon: Microscope,
    iconBg: '#e8f0fe',
    iconColor: '#3b5bdb',
  },
  {
    nameBn: 'বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট',
    nameEn: 'BARI',
    role: 'জয়দেবপুর, গাজীপুর-১৭০১',
    phone: '02-49270000',
    Icon: Leaf,
    iconBg: '#e8f7f0',
    iconColor: '#3d8c7a',
  },
  {
    nameBn: 'কৃষি সম্প্রসারণ অধিদপ্তর',
    nameEn: 'DAE HQ',
    role: 'খামারবাড়ি, ফার্মগেট, ঢাকা-১২১৫',
    phone: '02-9140850',
    Icon: Landmark,
    iconBg: '#fef3e2',
    iconColor: '#b45309',
  },
]

export default function KD1KrishiDirectory() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return DAE_OFFICERS
    return DAE_OFFICERS.filter(o =>
      o.name.toLowerCase().includes(q) ||
      o.designation.toLowerCase().includes(q)
    )
  }, [query])

  const showingAll = query.trim() === ''

  return (
    <div className="screen">
      <div className="topbar">
        <span className="text-base font-black text-ink-900">কৃষি কর্মকর্তা</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 pb-8">

        {/* Helpline — primary CTA */}
        <a
          href="tel:16123"
          className="flex items-center gap-4 rounded-2xl px-4 no-underline"
          style={{ background: '#3d8c7a', boxShadow: '0 4px 16px rgba(61,140,122,.25)', minHeight: 72 }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/20">
            <Phone size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0 py-4">
            <p className="text-base font-black text-white">কৃষি হেল্পলাইন</p>
            <p className="text-xs text-white/70 mt-0.5">বিনামূল্যে · যেকোনো মোবাইল থেকে · প্রতিদিন</p>
          </div>
          <span className="text-2xl font-black text-white flex-shrink-0">16123</span>
        </a>

        {/* Search */}
        <div
          className="flex items-center gap-3 rounded-2xl px-4 bg-white"
          style={{ border: '1.5px solid oklch(0.890 0.005 250)', minHeight: 52 }}
        >
          <Search size={18} className="text-ink-400 flex-shrink-0" />
          <input
            type="search"
            placeholder="নাম বা পদবি দিয়ে খুঁজুন..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-ink-900 placeholder-ink-400 outline-none border-none py-3"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-ink-400 flex-shrink-0">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Institutions — only show when not searching */}
        {showingAll && (
          <>
            <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mt-1">গবেষণা সংস্থা</p>
            {INSTITUTIONS.map(({ nameBn, nameEn, role, phone, Icon, iconBg, iconColor }) => (
              <a
                key={nameEn}
                href={`tel:${phone}`}
                className="flex items-center gap-3 bg-white rounded-2xl px-4 no-underline"
                style={{ border: '1.5px solid oklch(0.890 0.005 250)', minHeight: 72 }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: iconBg }}
                >
                  <Icon size={20} style={{ color: iconColor }} />
                </div>
                <div className="flex-1 min-w-0 py-4">
                  <p className="text-sm font-bold text-ink-900 leading-snug">{nameBn}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{role}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 rounded-xl px-3 py-2" style={{ background: '#ecf7f0' }}>
                  <Phone size={14} style={{ color: '#3d8c7a' }} />
                  <span className="text-xs font-bold" style={{ color: '#3d8c7a' }}>কল</span>
                </div>
              </a>
            ))}
          </>
        )}

        {/* Officer list header */}
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs font-bold text-ink-400 uppercase tracking-wide">
            {showingAll ? 'DAE কর্মকর্তা (প্রধান কার্যালয়)' : 'ফলাফল'}
          </p>
          <p className="text-xs text-ink-400">{filtered.length} জন</p>
        </div>

        {/* Officers */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Search size={32} className="text-ink-200" />
            <p className="text-sm text-ink-400">কোনো কর্মকর্তা পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((officer, idx) => (
              <OfficerCard key={idx} officer={officer} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

function OfficerCard({ officer }: { officer: typeof DAE_OFFICERS[0] }) {
  const primaryPhone = officer.phones[0]
  return (
    <div
      className="flex items-start gap-3 bg-white rounded-2xl p-4"
      style={{ border: '1.5px solid oklch(0.890 0.005 250)' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: '#ecf7f0' }}
      >
        <span className="text-sm font-black" style={{ color: '#3d8c7a' }}>
          {officer.name.charAt(officer.name.lastIndexOf(' ') + 1) || officer.name.charAt(0)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-ink-900 leading-snug">{officer.name}</p>
        <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">{officer.designation}</p>
        {officer.phones.length > 0 && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {officer.phones.map(ph => (
              <a
                key={ph}
                href={`tel:${ph}`}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 no-underline"
                style={{ background: '#ecf7f0' }}
              >
                <Phone size={11} style={{ color: '#3d8c7a' }} />
                <span className="text-xs font-bold" style={{ color: '#3d8c7a' }}>{ph}</span>
              </a>
            ))}
          </div>
        )}
      </div>
      {primaryPhone && (
        <a
          href={`tel:${primaryPhone}`}
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center no-underline"
          style={{ background: '#3d8c7a', boxShadow: '0 2px 6px rgba(61,140,122,.3)' }}
        >
          <Phone size={16} className="text-white" />
        </a>
      )}
    </div>
  )
}
