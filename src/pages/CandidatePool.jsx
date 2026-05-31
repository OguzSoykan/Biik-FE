import { useState, useEffect, useCallback } from 'react'
import CandidateTable from '../components/CandidateTable'
import CandidateDetail from '../components/CandidateDetail'
import { getCandidates } from '../api'

const STATUS_OPTIONS = [
  { value: '', label: 'Tüm Durumlar' },
  { value: 'written', label: 'Yazıldı' },
  { value: 'embedded', label: 'Embedded' },
  { value: 'extracted', label: 'Extracted' },
]

export default function CandidatePool() {
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const [search, setSearch] = useState('')
  const [skill, setSkill] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getCandidates({ search, skill, status, page, page_size: PAGE_SIZE })
      setData(res.data)
    } catch (e) {
      setError(e?.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }, [search, skill, status, page])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  // Filtre değişince page'i sıfırla
  const handleFilterChange = (setter) => (val) => {
    setter(val)
    setPage(1)
  }

  const candidates = data?.candidates ?? []
  const total = data?.total ?? 0
  const totalPages = data?.total_pages ?? 1

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Aday Havuzu</h1>
          <p className="text-slate-500 text-sm">
            {total > 0 ? `${total} aday bulundu` : 'İşlenmiş CV\'lerin listesi'}
          </p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => handleFilterChange(setSearch)(e.target.value)}
          placeholder="Ad soyad ara..."
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-52"
        />
        <input
          type="text"
          value={skill}
          onChange={(e) => handleFilterChange(setSkill)(e.target.value)}
          placeholder="Skill filtrele... (ör: Python)"
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-52"
        />
        <select
          value={status}
          onChange={(e) => handleFilterChange(setStatus)(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {(search || skill || status) && (
          <button
            onClick={() => { handleFilterChange(setSearch)(''); handleFilterChange(setSkill)(''); handleFilterChange(setStatus)('') }}
            className="text-xs text-slate-500 hover:text-slate-700 underline self-center"
          >
            Temizle
          </button>
        )}
      </div>

      {/* Tablo */}
      {loading && <p className="text-slate-400 text-sm">Yükleniyor...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && !error && candidates.length === 0 && (
        <p className="text-slate-400 text-sm">Sonuç bulunamadı.</p>
      )}

      {!loading && candidates.length > 0 && (
        <CandidateTable candidates={candidates} onSelect={setSelected} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-slate-400">
            Sayfa {page} / {totalPages} ({total} toplam)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Önceki
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 text-sm border rounded-lg ${
                    p === page
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sonraki →
            </button>
          </div>
        </div>
      )}

      <CandidateDetail candidate={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
