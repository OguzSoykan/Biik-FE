import { useState, useEffect } from 'react'
import CandidateTable from '../components/CandidateTable'
import CandidateDetail from '../components/CandidateDetail'
import { getCandidates } from '../api'
import { useApi } from '../hooks/useApi'

export default function CandidatePool() {
  const [selected, setSelected] = useState(null)
  const { loading, error, data, execute } = useApi()

  useEffect(() => {
    execute(getCandidates)
  }, [])

  const candidates = data || []

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Aday Havuzu</h1>
      <p className="text-slate-500 text-sm mb-8">
        İşlenmiş CV'lerin listesi. Detay için satıra tıklayın.
      </p>

      {loading && (
        <p className="text-slate-400 text-sm">Yükleniyor...</p>
      )}

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {!loading && !error && candidates.length === 0 && (
        <p className="text-slate-400 text-sm">Henüz işlenmiş CV yok.</p>
      )}

      {!loading && candidates.length > 0 && (
        <CandidateTable candidates={candidates} onSelect={setSelected} />
      )}

      <CandidateDetail candidate={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
