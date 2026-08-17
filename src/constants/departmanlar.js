/**
 * Departman renkleri.
 *
 * Backend yalnızca bir renk TOKEN'ı gönderir ("blue", "red", …); gerçek CSS
 * sınıfları burada durur çünkü Tailwind sınıf adlarını derleme anında tarar —
 * `bg-${renk}-50` gibi dinamik birleştirmeler üretilmez ve stil kaybolur.
 */
export const DEPARTMAN_RENK = {
  blue:    { rozet: 'bg-blue-50 text-blue-700 border-blue-200',          nokta: 'bg-blue-500' },
  red:     { rozet: 'bg-red-50 text-red-700 border-red-200',             nokta: 'bg-red-500' },
  orange:  { rozet: 'bg-orange-50 text-orange-700 border-orange-200',    nokta: 'bg-orange-500' },
  emerald: { rozet: 'bg-emerald-50 text-emerald-700 border-emerald-200', nokta: 'bg-emerald-500' },
  purple:  { rozet: 'bg-purple-50 text-purple-700 border-purple-200',    nokta: 'bg-purple-500' },
  slate:   { rozet: 'bg-slate-100 text-slate-700 border-slate-300',      nokta: 'bg-slate-500' },
  teal:    { rozet: 'bg-teal-50 text-teal-700 border-teal-200',          nokta: 'bg-teal-500' },
  indigo:  { rozet: 'bg-indigo-50 text-indigo-700 border-indigo-200',    nokta: 'bg-indigo-500' },
  amber:   { rozet: 'bg-amber-50 text-amber-800 border-amber-200',       nokta: 'bg-amber-500' },
  stone:   { rozet: 'bg-stone-100 text-stone-700 border-stone-300',      nokta: 'bg-stone-500' },
}

export const NOTR_ROZET = 'bg-white text-slate-400 border-slate-200'

export const renkSinifi = (renk, alan = 'rozet') =>
  DEPARTMAN_RENK[renk]?.[alan] ?? (alan === 'nokta' ? 'bg-slate-300' : NOTR_ROZET)
