// ST1 — Settings
import { Moon, Sun, Info, Leaf } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function SettingsScreen() {
  const { dark, toggle } = useTheme()

  return (
    <div className="screen">
      <div className="topbar">
        <span className="text-base font-black text-ink-900">সেটিংস</span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 pb-8">

        <div className="card p-4">
          <div className="flex items-center justify-between" style={{ minHeight: 56 }}>
            <div className="flex items-center gap-3">
              {dark
                ? <Moon size={20} className="text-ink-500" />
                : <Sun size={20} className="text-ink-500" />
              }
              <div>
                <p className="text-sm font-semibold text-ink-900">ডার্ক মোড</p>
                <p className="text-xs text-ink-400">{dark ? 'চালু আছে' : 'বন্ধ আছে'}</p>
              </div>
            </div>
            <button
              onClick={toggle}
              role="switch"
              aria-checked={dark}
              style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                background: dark ? '#3d8c7a' : '#d4d2cc',
                border: 'none',
                position: 'relative',
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'background 200ms ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  left: 4,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  background: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,.25)',
                  transition: 'transform 200ms ease',
                  transform: dark ? 'translateX(20px)' : 'translateX(0)',
                  display: 'block',
                }}
              />
            </button>
          </div>
        </div>

        <div className="card p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#ecf7f0' }}
            >
              <Leaf size={20} style={{ color: '#3d8c7a' }} />
            </div>
            <div>
              <p className="text-sm font-bold text-ink-900">ফসল ডাক্তার</p>
              <p className="text-xs text-ink-400">সংস্করণ ১.০</p>
            </div>
          </div>
          <div className="h-px bg-ink-100" />
          <div className="flex items-start gap-3">
            <Info size={16} className="text-ink-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-ink-500 leading-relaxed">
              এই অ্যাপটি ধান গাছের রোগ শনাক্ত করতে সাহায্য করে। AI ব্যবহার করে রোগ চিহ্নিত করা হয়, তবে নিশ্চিত হতে কৃষি বিশেষজ্ঞের পরামর্শ নিন।
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
