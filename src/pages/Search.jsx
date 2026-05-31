import { useState } from 'react'
import SearchBar from '../components/SearchBar'
import ResultCard from '../components/ResultCard'
import { recommendCandidates } from '../api'

const EXAMPLE_QUERIES = [
  'Python ve machine learning deneyimi olan backend developer',
  '5 yıl Java deneyimi olan senior yazılım mühendisi',
  'React ve Node.js bilen full-stack developer',
  'Veri bilimi ve istatistik geçmişi olan analist',
]

export default function Search() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (q) => {
    const activeQuery = q || query
    if (!activeQuery.trim()) return
    setQuery(activeQuery)
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await recommendCandidates(activeQuery.trim())
      setResult(data)
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'Bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const hasCandidates = result?.candidates?.length > 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Aday Arama</h1>
      <p className="text-slate-500 text-sm mb-6">
        Doğal dil ile aday arayın. LangGraph agent + GraphRAG pipeline.
      </p>

      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={() => handleSubmit()}
        disabled={loading}
        placeholder="Örn: 5 yıl Python deneyimi olan, ML projelerinde çalışmış backend developer"
      />

      {/* Örnek sorgular */}
      {!result && !loading && (
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => handleSubmit(q)}
              className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 hover:bg-indigo-100 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Yüklenme */}
      {loading && (
        <div className="mt-10 flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Sorgu genişletiliyor, graph taranıyor, adaylar puanlanıyor…</p>
        </div>
      )}

      {/* Hata */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">
          <strong>Hata:</strong> {error}
        </div>
      )}

      {/* Sonuçlar */}
      {result && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700">
              {hasCandidates
                ? `${result.candidates.length} Aday Bulundu`
                : 'Aday Bulunamadı'}
            </h2>
            <span className="text-xs text-slate-400 max-w-xs truncate">{result.query}</span>
          </div>

          {/* Aday kartları */}
          {hasCandidates ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.candidates.slice(0, 5).map((c, i) => (
                <ResultCard key={c.id ?? i} candidate={c} rank={i + 1} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-8 text-center">
              <p className="text-slate-500 text-sm mb-2">
                {result.answer}
              </p>
              <button
                onClick={() => { setResult(null); setQuery('') }}
                className="mt-3 text-xs text-indigo-600 underline"
              >
                Yeni arama yap
              </button>
            </div>
          )}

          {/* Agent özeti */}
          {hasCandidates && result.answer && (
            <details className="mt-4">
              <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
                Agent değerlendirmesini göster
              </summary>
              <div className="mt-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                {result.answer}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
