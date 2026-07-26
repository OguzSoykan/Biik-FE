import { NavLink } from 'react-router-dom'
import { useQueue } from '../../hooks/useQueue'

function QueueBadge() {
  const { counts, processing } = useQueue()
  if (counts.total === 0) return null

  const active = counts.running + counts.queued
  if (!processing && active === 0) return null

  return (
    <span className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full px-2.5 py-1">
      <span className="w-2.5 h-2.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      {counts.done}/{counts.total} işlendi
    </span>
  )
}

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors pb-0.5 ${
      isActive
        ? 'text-indigo-600 border-b-2 border-indigo-600'
        : 'text-slate-600 hover:text-slate-900'
    }`

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-indigo-700 text-lg tracking-tight">BiIK</span>
          <QueueBadge />
        </div>
        <div className="flex gap-6">
          <NavLink to="/" end className={linkClass}>
            CV Yönetimi
          </NavLink>
          <NavLink to="/havuz" className={linkClass}>
            Aday Havuzu
          </NavLink>
          <NavLink to="/arama" className={linkClass}>
            Arama
          </NavLink>
          <NavLink to="/feedback" className={linkClass}>
            Geri Bildirim
          </NavLink>
        </div>
      </div>
    </nav>
  )
}
