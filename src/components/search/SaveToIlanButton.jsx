import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { addAdayToIlan, createIlan, getIlanlar } from '../../api'

/**
 * Aday kartında "İlana kaydet" butonu.
 * Tıklayınca mevcut ilanlar açılır; birini seçince aday oraya eklenir.
 * Listeden yeni ilan da oluşturulabilir — aramadan çıkmak gerekmez.
 */
export default function SaveToIlanButton({ adayId, adayAd }) {
  const [open, setOpen] = useState(false)
  const [ilanlar, setIlanlar] = useState(null)
  const [loading, setLoading] = useState(false)
  const [yeniAd, setYeniAd] = useState('')
  const [kaydedilen, setKaydedilen] = useState(() => new Set())
  const wrapRef = useRef(null)

  // Dışına tıklayınca kapat
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const aç = async (e) => {
    e.stopPropagation()
    const next = !open
    setOpen(next)
    if (next && ilanlar === null) {
      setLoading(true)
      try {
        const data = await getIlanlar()
        setIlanlar(data.ilanlar)
      } catch (err) {
        toast.error(err?.userMessage || 'İlanlar yüklenemedi.')
        setIlanlar([])
      } finally {
        setLoading(false)
      }
    }
  }

  const kaydet = async (ilan) => {
    try {
      const res = await addAdayToIlan(ilan.id, adayId)
      setKaydedilen((prev) => new Set(prev).add(ilan.id))
      toast.success(
        res.eklendi
          ? `${adayAd || 'Aday'} → ${ilan.ad}`
          : `${adayAd || 'Aday'} bu ilanda zaten var`
      )
      setOpen(false)
    } catch (err) {
      toast.error(err?.userMessage || 'Kaydedilemedi.')
    }
  }

  const yeniIlanaKaydet = async (e) => {
    e.preventDefault()
    const ad = yeniAd.trim()
    if (!ad) return
    try {
      const ilan = await createIlan(ad)
      setIlanlar((prev) => [ilan, ...(prev || [])])
      setYeniAd('')
      await kaydet(ilan)
    } catch (err) {
      toast.error(err?.userMessage || 'İlan oluşturulamadı.')
    }
  }

  return (
    <div className="relative" ref={wrapRef} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={aç}
        className="text-xs text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 hover:border-indigo-300 transition-colors"
        title="Bu adayı bir ilana kaydet"
      >
        {kaydedilen.size > 0 ? '✓ Kaydedildi' : '+ İlana kaydet'}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-60 bg-white border border-slate-200 rounded-xl shadow-lg p-2">
          {loading && <p className="text-xs text-slate-400 px-2 py-1.5">Yükleniyor…</p>}

          {!loading && ilanlar?.length === 0 && (
            <p className="text-xs text-slate-400 px-2 py-1.5">
              Henüz ilan yok — aşağıdan oluştur.
            </p>
          )}

          {!loading && ilanlar?.length > 0 && (
            <ul className="max-h-44 overflow-y-auto">
              {ilanlar.map((i) => (
                <li key={i.id}>
                  <button
                    onClick={() => kaydet(i)}
                    className="w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-indigo-50 flex items-center justify-between gap-2"
                  >
                    <span className="truncate text-slate-700">{i.ad}</span>
                    <span className="text-slate-400 shrink-0">
                      {kaydedilen.has(i.id) ? '✓' : i.aday_sayisi}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={yeniIlanaKaydet} className="border-t border-slate-100 mt-1 pt-2 flex gap-1">
            <input
              value={yeniAd}
              onChange={(e) => setYeniAd(e.target.value)}
              placeholder="Yeni ilan adı"
              className="flex-1 min-w-0 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
            <button
              type="submit"
              disabled={!yeniAd.trim()}
              className="text-xs bg-indigo-600 text-white rounded-lg px-2.5 py-1.5 disabled:opacity-40"
            >
              Ekle
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
