import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import CandidateDetail from '../components/candidates/CandidateDetail'
import DepartmanLegend from '../components/ilan/DepartmanLegend'
import { renkSinifi } from '../constants/departmanlar'
import {
  getCandidate, getIlan, removeAdayFromIlan, updateIlan, reorderIlan, updateAdayInIlan,
} from '../api'

const DURUM_STIL = {
  incelenecek: 'bg-slate-100 text-slate-600 border-slate-200',
  gorusuldu: 'bg-amber-50 text-amber-700 border-amber-200',
  elendi: 'bg-red-50 text-red-600 border-red-200',
  teklif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}
const DURUM_ETIKET = {
  incelenecek: 'İncelenecek',
  gorusuldu: 'Görüşüldü',
  elendi: 'Elendi',
  teklif: 'Teklif',
}

export default function IlanDetail() {
  const { ilanId } = useParams()
  const [ilan, setIlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [adAlani, setAdAlani] = useState('')
  const [adDuzenle, setAdDuzenle] = useState(false)
  const [notDuzenle, setNotDuzenle] = useState(null)   // {aday_id, metin}
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const yukle = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getIlan(ilanId)
      setIlan(data)
      setAdAlani(data.ad)
    } catch (e) {
      setError(e?.userMessage || 'İlan yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }, [ilanId])

  useEffect(() => { yukle() }, [yukle])

  const adKaydet = async () => {
    const ad = adAlani.trim()
    if (!ad || ad === ilan.ad) { setAdDuzenle(false); return }
    try {
      await updateIlan(ilanId, { ad })
      setIlan((p) => ({ ...p, ad }))
      toast.success('İlan adı güncellendi')
    } catch (e) {
      toast.error(e?.userMessage || 'Güncellenemedi.')
      setAdAlani(ilan.ad)
    } finally {
      setAdDuzenle(false)
    }
  }

  const durumDegistir = async (aday, durum) => {
    const eski = aday.durum
    setIlan((p) => ({
      ...p,
      adaylar: p.adaylar.map((a) => (a.aday_id === aday.aday_id ? { ...a, durum } : a)),
    }))
    try {
      await updateAdayInIlan(ilanId, aday.aday_id, { durum })
    } catch (e) {
      toast.error(e?.userMessage || 'Durum güncellenemedi.')
      setIlan((p) => ({
        ...p,
        adaylar: p.adaylar.map((a) => (a.aday_id === aday.aday_id ? { ...a, durum: eski } : a)),
      }))
    }
  }

  const ilanDepartmaniDegistir = async (key) => {
    // Aynı departmana tekrar tıklamak etiketi kaldırır
    const yeni = ilan.departman === key ? '' : key
    const eski = ilan.departman
    setIlan((p) => ({ ...p, departman: yeni }))
    try {
      await updateIlan(ilanId, { departman: yeni })
    } catch (e) {
      toast.error(e?.userMessage || 'Departman güncellenemedi.')
      setIlan((p) => ({ ...p, departman: eski }))
    }
  }

  const notKaydet = async () => {
    if (!notDuzenle) return
    const { aday_id, metin } = notDuzenle
    try {
      await updateAdayInIlan(ilanId, aday_id, { notu: metin })
      setIlan((p) => ({
        ...p,
        adaylar: p.adaylar.map((a) => (a.aday_id === aday_id ? { ...a, notu: metin } : a)),
      }))
    } catch (e) {
      toast.error(e?.userMessage || 'Not kaydedilemedi.')
    } finally {
      setNotDuzenle(null)
    }
  }

  const tasi = async (index, yon) => {
    const hedef = index + yon
    if (hedef < 0 || hedef >= ilan.adaylar.length) return
    const yeni = [...ilan.adaylar]
    ;[yeni[index], yeni[hedef]] = [yeni[hedef], yeni[index]]
    setIlan((p) => ({ ...p, adaylar: yeni }))
    try {
      await reorderIlan(ilanId, yeni.map((a) => a.aday_id))
    } catch (e) {
      toast.error(e?.userMessage || 'Sıralama kaydedilemedi.')
      yukle()
    }
  }

  const cikar = async (aday) => {
    try {
      await removeAdayFromIlan(ilanId, aday.aday_id)
      setIlan((p) => ({ ...p, adaylar: p.adaylar.filter((a) => a.aday_id !== aday.aday_id) }))
      toast.success(`${aday.aday_ad} ilandan çıkarıldı`)
    } catch (e) {
      toast.error(e?.userMessage || 'Çıkarılamadı.')
    }
  }

  const profilAc = async (adayId) => {
    setDetailLoading(true)
    setDetail({ id: adayId, name: '', skills: [], companies: [], education: [] })
    try {
      setDetail(await getCandidate(adayId))
    } catch (e) {
      toast.error(e?.userMessage || 'Profil yüklenemedi.')
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-10 text-slate-400 text-sm">Yükleniyor…</div>
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">
          <strong>Hata:</strong> {error}
        </div>
        <Link to="/ilanlar" className="text-indigo-600 underline text-sm mt-4 inline-block">
          ← İlanlarım
        </Link>
      </div>
    )
  }

  const durumlar = ilan.durumlar || Object.keys(DURUM_ETIKET)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to="/ilanlar" className="text-xs text-slate-500 hover:text-slate-700">
        ← İlanlarım
      </Link>

      <div className="mt-2 mb-6">
        {adDuzenle ? (
          <div className="flex gap-2">
            <input
              value={adAlani}
              onChange={(e) => setAdAlani(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && adKaydet()}
              autoFocus
              className="flex-1 text-xl font-bold text-slate-800 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button onClick={adKaydet} className="text-sm bg-indigo-600 text-white rounded-lg px-4">
              Kaydet
            </button>
          </div>
        ) : (
          <h1
            onClick={() => setAdDuzenle(true)}
            title="Adı düzenlemek için tıklayın"
            className="text-2xl font-bold text-slate-800 cursor-pointer hover:text-indigo-700 inline-block"
          >
            {ilan.ad}
          </h1>
        )}
        <p className="text-slate-500 text-sm mt-1">
          {ilan.adaylar.length} aday · sıralamayı oklarla değiştirebilir, her adaya not yazabilirsiniz
        </p>

        {/* İlanın departmanı — bu ilan hangi alan için açıldı */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
            Departman
          </span>
          {(ilan.departmanlar || []).map((d) => {
            const secili = ilan.departman === d.key
            return (
              <button
                key={d.key}
                onClick={() => ilanDepartmaniDegistir(d.key)}
                title={`${d.ad} — ${d.aciklama} (${d.yaka})`}
                className={`text-xs border rounded-full px-2.5 py-1 inline-flex items-center gap-1.5 transition-colors ${
                  secili ? renkSinifi(d.renk) : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${renkSinifi(d.renk, 'nokta')}`} />
                {secili ? d.ad : d.ad.split(' / ')[0]}
              </button>
            )
          })}
        </div>
      </div>

      <DepartmanLegend departmanlar={ilan.departmanlar || []} />

      {ilan.adaylar.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-10 text-center">
          <p className="text-slate-500 text-sm">
            Bu ilanda henüz aday yok.{' '}
            <Link to="/arama" className="text-indigo-600 underline">Arama</Link>{' '}
            sayfasında bulduğunuz adayları kartlardaki "İlana kaydet" ile ekleyin.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {ilan.adaylar.map((a, idx) => (
            <li
              key={a.aday_id}
              className={`bg-white border rounded-xl px-5 py-4 ${
                a.notu ? 'border-indigo-300 ring-1 ring-indigo-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Sıra + taşıma */}
                <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
                  <button
                    onClick={() => tasi(idx, -1)}
                    disabled={idx === 0}
                    className="text-slate-400 hover:text-indigo-600 disabled:opacity-25 leading-none"
                    title="Yukarı taşı"
                  >
                    ▲
                  </button>
                  <span className="text-xs font-bold text-slate-500">{idx + 1}</span>
                  <button
                    onClick={() => tasi(idx, 1)}
                    disabled={idx === ilan.adaylar.length - 1}
                    className="text-slate-400 hover:text-indigo-600 disabled:opacity-25 leading-none"
                    title="Aşağı taşı"
                  >
                    ▼
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => profilAc(a.aday_id)}
                      className="font-medium text-slate-800 hover:text-indigo-700 truncate"
                    >
                      {a.aday_ad}
                    </button>
                    <span className="text-xs text-slate-400">{a.yetenek_sayisi} yetenek</span>
                  </div>

                  {/* Durum seçimi */}
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {durumlar.map((d) => (
                      <button
                        key={d}
                        onClick={() => durumDegistir(a, d)}
                        className={`text-xs border rounded-full px-2.5 py-0.5 transition-colors ${
                          a.durum === d
                            ? DURUM_STIL[d] || 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {DURUM_ETIKET[d] || d}
                      </button>
                    ))}
                  </div>

                  {/* Not — vurgulanmış */}
                  {notDuzenle?.aday_id === a.aday_id ? (
                    <div className="mt-2">
                      <textarea
                        value={notDuzenle.metin}
                        onChange={(e) => setNotDuzenle({ ...notDuzenle, metin: e.target.value })}
                        rows={3}
                        autoFocus
                        placeholder="Bu aday hakkında notunuz…"
                        className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <div className="flex gap-2 mt-1">
                        <button onClick={notKaydet} className="text-xs bg-indigo-600 text-white rounded-lg px-3 py-1">
                          Kaydet
                        </button>
                        <button
                          onClick={() => setNotDuzenle(null)}
                          className="text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-1"
                        >
                          Vazgeç
                        </button>
                      </div>
                    </div>
                  ) : a.notu ? (
                    <button
                      onClick={() => setNotDuzenle({ aday_id: a.aday_id, metin: a.notu })}
                      className="mt-2 w-full text-left bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg px-3 py-2 hover:bg-indigo-100 transition-colors"
                      title="Notu düzenle"
                    >
                      <span className="text-[10px] uppercase tracking-wide text-indigo-500 font-semibold">
                        Not
                      </span>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{a.notu}</p>
                    </button>
                  ) : (
                    <button
                      onClick={() => setNotDuzenle({ aday_id: a.aday_id, metin: '' })}
                      className="mt-2 text-xs text-slate-400 hover:text-indigo-600"
                    >
                      + Not ekle
                    </button>
                  )}
                </div>

                <button
                  onClick={() => cikar(a)}
                  className="text-xs text-slate-400 hover:text-red-500 shrink-0"
                  title="İlandan çıkar"
                >
                  Çıkar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CandidateDetail
        candidate={detail}
        loading={detailLoading}
        onClose={() => setDetail(null)}
      />
    </div>
  )
}
