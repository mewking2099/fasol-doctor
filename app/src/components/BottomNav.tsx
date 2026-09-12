import { useNavigate, useLocation } from 'react-router-dom'
import { Home, ScanLine, Users, Images, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Tab {
  path: string
  icon: LucideIcon
  label: string
}

const TABS: Tab[] = [
  { path: '/',          icon: Home,     label: 'হোম' },
  { path: '/camera',   icon: ScanLine, label: 'স্ক্যান' },
  { path: '/directory', icon: Users,    label: 'অফিসার' },
  { path: '/gallery',  icon: Images,   label: 'গ্যালারি' },
  { path: '/settings', icon: Settings, label: 'সেটিংস' },
]

export default function BottomNav() {
  const nav = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="bottom-nav" aria-label="প্রধান নেভিগেশন">
      {TABS.map(({ path, icon: Icon, label }) => {
        const active = pathname === path
        return (
          <button
            key={path}
            onClick={() => nav(path)}
            className="bottom-nav-item"
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
