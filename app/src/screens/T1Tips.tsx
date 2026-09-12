// T1 — Monthly agri tips
import { useNavigate } from 'react-router-dom'
import { Sprout, ChevronLeft } from 'lucide-react'
import { useAudio } from '../hooks/useAudio'

export default function T1Tips() {
  useAudio('home.b3')
  const nav = useNavigate()

  return (
    <div className="screen">
      <div className="topbar">
        <button onClick={() => nav(-1)} className="topbar-back flex items-center gap-1">
          <ChevronLeft size={18} />
          পিছনে
        </button>
        <span className="text-sm font-bold text-ink-900 ml-2">কৃষি টিপস</span>
      </div>

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="card p-8 flex flex-col items-center justify-center gap-3 text-center">
          <Sprout size={48} className="text-sage-400" />
          <p className="text-sm text-ink-400">এই মাসের টিপস শীঘ্রই আসছে।</p>
        </div>
      </div>
    </div>
  )
}
