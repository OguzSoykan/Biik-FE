import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createIlan, deleteIlan, getIlanlar } from '../api'
import DepartmanLegend from '../components/ilan/DepartmanLegend'
import { renkSinifi } from '../constants/departmanlar'

export default function Ilanlar() {
  const [ilanlar, setIlanlar] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [yeniAd, setYeniAd] = useState('')
  const [silinecek, setSilinecek] = useState(null)   // onay bekleyen ilan
  const [departmanlar, setDepartmanlar] = useState([])
  const [yeniDep, setYeniDep] = useState('')

  const yukle = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getIlanlar()
      setIlanlar(data.ilanlar)
      setDepartmanlar(data.departmanlar || [])
    } catch (e) {
      setError(e?.userMessage || 'İlanlar yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { yukle() }, [yukle])

  const olustur = async (e) => {
    e.preventDefault()
    const ad = yeniAd.trim()
    if (!ad) return
    try {
      const ilan = await createIlan(ad, yeniDep)
      setIlanlar((prev) => [ilan, ...prev])
      setYeniAd('')
      setYeniDep('')
      toast.success(`"${ilan.ad}" oluşturuldu`)
    } catch (e) {
      toast.error(e?.userMessage || 'İlan oluşturulamadı.')
    }
  }

  const sil = async (ilan) => {
    try {
      await deleteIlan(ilan.id)
      setIlanlar((prev) => prev.filter((i) => i.id !== ilan.id))
      toast.success(`"${ilan.ad}" silindi`)
    } catch (e) {
      toast.error(e?.userMessage || 'Silinemedi.')
    } finally {
      setSilinecek(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">İlanlarım</h1>
        <p className="text-slate-500 text-sm">
          Aday listelerinizi burada tutun. Aramada bulduğunuz adayları bir ilana
          kaydedip sıralayabilir, her aday için not tutabilirsiniz. İlanlar yalnızca
          size görünür.
        </p>
      </div>

      {/* Yeni ilan */}
      <form onSubmit={olustur} className="flex gap-2 mb-6">
        <input
          value={yeniAd}
          onChange={(e) => setYeniAd(e.target.value)}
          placeholder="Yeni ilan adı — örn: Senior Backend Developer, Q3"
          className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        />
        <select
          value={yeniDep}
          onChange={(e) => setYeniDep(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          title="Bu ilan hangi departman için?"
        >
          <option value="">Departman (opsiyonel)</option>
          {departmanlar.map((d) => (
            <option key={d.key} value={d.key}>{d.ad}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!yeniAd.trim()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          İlan oluştur
        </button>
      </form>

      <DepartmanLegend departmanlar={departmanlar} />

      {loading && <p className="text-slate-400 text-sm">Yükleniyor…</p>}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">
          <strong>Hata:</strong> {error}
        </div>
      )}

      {!loading && !error && ilanlar.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-10 text-center">
          <p className="text-slate-500 text-sm">
            Henüz ilan yok. Yukarıdan bir ilan oluşturun, sonra{' '}
            <Link to="/arama" className="text-indigo-600 underline">Arama</Link>{' '}
            sayfasından aday ekleyin.
          </p>
        </div>
      )}

      {ilanlar.length > 0 && (
        <ul className="space-y-3">
          {ilanlar.map((i) => (
            <li
              key={i.id}
              className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow"
            >
              <Link to={`/ilanlar/${i.id}`} className="min-w-0 flex-1 group">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-slate-800 truncate group-hover:text-indigo-700">
                    {i.ad}
                  </p>
                  {i.departman && (() => {
                    const d = departmanlar.find((x) => x.key === i.departman)
                    return (
                      <span className={`text-xs border rounded-full px-2 py-0.5 ${renkSinifi(d?.renk)}`}>
                        {d?.ad || i.departman}
                      </span>
                    )
                  })()}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {i.aday_sayisi} aday
                  {i.olusturuldu && ` · ${new Date(i.olusturuldu).toLocaleDateString('tr-TR')}`}
                </p>
              </Link>

              {silinecek === i.id ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-500">Emin misiniz?</span>
                  <button
                    onClick={() => sil(i)}
                    className="text-xs text-white bg-red-500 rounded-lg px-2.5 py-1 hover:bg-red-600"
                  >
                    Sil
                  </button>
                  <button
                    onClick={() => setSilinecek(null)}
                    className="text-xs text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50"
                  >
                    Vazgeç
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSilinecek(i.id)}
                  className="text-xs text-slate-400 hover:text-red-500 shrink-0"
                  title="İlanı sil"
                >
                  Sil
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
