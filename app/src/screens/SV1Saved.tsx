// SV1 — Saved reports
import { useNavigate } from 'react-router-dom'
import { ClipboardList, ScanLine, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSession } from '../context/SessionContext'
import { DISEASE_META } from '../lib/diseaseMeta'

export default function SV1Saved() {
  const nav = useNavigate()
  const { session } = useSession()

  const hasSaved = session.saved && session.disease

  return (
    <div className="screen">
      <div className="topbar">
        <button onClick={() => nav(-1)} className="topbar-back flex items-center gap-1">
          <ChevronLeft size={18} />
          পিছনে
        </button>
        <span className="text-sm font-bold text-ink-900">আমার রিপোর্ট</span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {hasSaved && session.disease ? (
          <>
            <button
              onClick={() => nav('/result')}
              className="flex items-center gap-4 bg-white rounded-2xl px-4 w-full text-left active:scale-[.98] transition-transform"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,.06)', border: '2px solid transparent', minHeight: 72 }}
            >
              <img
                src={DISEASE_META[session.disease].imgUrl}
                alt={`${DISEASE_META[session.disease].nameBn} রোগের লক্ষণ`}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-ink-900">{DISEASE_META[session.disease].nameBn}</p>
                <p className="text-xs text-ink-400 mt-0.5">
                  এইমাত্র · {DISEASE_META[session.disease].en}
                </p>
              </div>
              <ChevronRight size={18} className="text-ink-300 flex-shrink-0" />
            </button>

            <div className="h-px bg-ink-100" />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
            <div className="w-16 h-16 rounded-2xl bg-warm-100 flex items-center justify-center">
              <ClipboardList size={28} className="text-ink-400" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-ink-700">কোনো রিপোর্ট নেই</p>
              <p className="text-sm text-ink-400 mt-1">রোগ শনাক্ত করার পর রিপোর্ট সেভ করুন</p>
            </div>
          </div>
        )}

        <p className="text-sm text-ink-300 text-center">নতুন রিপোর্ট সেভ করতে ফসল স্ক্যান করুন</p>
        <button
          className="btn-secondary flex items-center justify-center gap-2"
          onClick={() => nav('/camera')}
        >
          <ScanLine size={18} />
          নতুন স্ক্যান
        </button>
      </div>
    </div>
  )
}
