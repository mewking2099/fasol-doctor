// SNM — No match / unclear result
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanLine, Sun, ZoomIn, Leaf, Phone, ChevronLeft } from 'lucide-react'
import { useSession } from '../context/SessionContext'
import { saveScan, makeThumbnail } from '../lib/scanHistory'

const TIPS = [
  { Icon: Sun,    text: 'রোদের আলোয় ছবি তুলুন' },
  { Icon: ZoomIn, text: 'পাতার কাছে গিয়ে ছবি তুলুন' },
  { Icon: Leaf,   text: 'আক্রান্ত পাতাটি মাঝখানে রাখুন' },
]

export default function SNMNoMatch() {
  const nav = useNavigate()
  const { session, reset } = useSession()

  useEffect(() => {
    const url = session.photos?.[0]
    if (!url) return
    makeThumbnail(url).then(thumbnail =>
      saveScan({ thumbnail, disease: null, timestamp: Date.now() })
    )
  }, [])

  function retry() {
    reset()
    nav('/camera')
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button onClick={retry} className="topbar-back flex items-center gap-1">
          <ChevronLeft size={18} />
          পিছনে
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">

        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: '#f3f0eb', boxShadow: '0 2px 8px rgba(0,0,0,.07)' }}
        >
          <ScanLine size={36} className="text-ink-400" />
        </div>

        <p className="text-2xl font-black text-ink-900 leading-tight mt-6">রোগ শনাক্ত হয়নি</p>
        <p className="text-sm text-ink-500 leading-relaxed max-w-xs mt-2">
          ছবি পরিষ্কার হয়নি, অথবা পাতায় কোনো পরিচিত রোগের লক্ষণ দেখা যায়নি।
        </p>

        {/* Tips */}
        <div className="card p-4 mt-6 w-full text-left">
          <p className="text-sm font-bold text-sage-600 mb-3">ভালো ছবির জন্য</p>
          <div className="flex flex-col gap-3">
            {TIPS.map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#ecf7f0' }}
                >
                  <Icon size={15} style={{ color: '#3d8c7a' }} />
                </div>
                <p className="text-sm text-ink-600">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full mt-6">
          <button className="btn-primary flex items-center justify-center gap-2" onClick={retry}>
            <ScanLine size={18} />
            আবার চেষ্টা করুন
          </button>

          <a
            href="tel:16123"
            className="flex items-center justify-center gap-2 bg-white rounded-2xl py-4 font-bold text-sm no-underline"
            style={{ border: '1.5px solid oklch(0.890 0.005 250)', color: '#3d8c7a', minHeight: 52 }}
          >
            <Phone size={16} />
            কৃষি হেল্পলাইন — ১৬১২৩
          </a>
        </div>

      </div>
    </div>
  )
}
