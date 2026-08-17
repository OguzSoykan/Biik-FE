import { useState } from 'react'
import { renkSinifi } from '../../constants/departmanlar'

/**
 * Renklerin ne anlama geldiğini açıklayan küçük bilgi kutusu.
 * Varsayılan olarak kapalı durur; "Renkler ne anlama geliyor?" ile açılır,
 * böylece sayfanın üstünü sürekli kaplamaz.
 */
export default function DepartmanLegend({ departmanlar = [] }) {
  const [acik, setAcik] = useState(false)
  if (!departmanlar.length) return null

  const yakalar = [...new Set(departmanlar.map((d) => d.yaka))]

  return (
    <div className="mb-4">
      <button
        onClick={() => setAcik((v) => !v)}
        className="text-xs text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1"
      >
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-slate-300 text-[10px] leading-none">
          ?
        </span>
        Renkler ne anlama geliyor
        <span className="text-slate-400">{acik ? '▲' : '▼'}</span>
      </button>

      {acik && (
        <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-500 mb-3">
            Her adaya ilan içinde bir departman etiketi verebilirsiniz. Renk, listeyi
            hızlıca taramanızı sağlar; etiket yalnızca bu ilana özeldir.
          </p>

          {yakalar.map((yaka) => (
            <div key={yaka} className="mb-3 last:mb-0">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1.5">
                {yaka}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {departmanlar
                  .filter((d) => d.yaka === yaka)
                  .map((d) => (
                    <li key={d.key} className="flex items-start gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${renkSinifi(d.renk, 'nokta')}`}
                      />
                      <span className="text-xs leading-tight">
                        <span className="text-slate-700 font-medium">{d.ad}</span>
                        <span className="text-slate-400"> — {d.aciklama}</span>
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
