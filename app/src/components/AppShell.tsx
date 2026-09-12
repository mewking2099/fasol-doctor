import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppShell() {
  return (
    <>
      <Outlet />
      <div className="shell-spacer" aria-hidden />
      <BottomNav />
    </>
  )
}
