import { NavLink } from 'react-router-dom'

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
        <span className="font-bold text-indigo-700 text-lg tracking-tight">BiIK</span>
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
        </div>
      </div>
    </nav>
  )
}
