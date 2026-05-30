import { useState } from 'react'
import SearchBar from '../components/SearchBar'
import { recommendCandidates } from '../api'

export default function Search() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await recommendCandidates(query.trim())
      setResult(data)
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'Bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Aday Arama</h1>
      <p className="text-slate-500 text-sm mb-8">
        Doğal dil ile aday arayın. LangGraph agent + GraphRAG pipeline.
      </p>

      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={handleSubmit}
        disabled={loading}
        placeholder="Örn: 5 yıl Python deneyimi olan, ML projelerinde çalışmış backend developer"
      />

      {loading && (
        <div className="mt-8 flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Agent çalışıyor — sorgu genişletiliyor, graph taranıyor, adaylar puanlanıyor…</p>
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">
          <strong>Hata:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-6">
          <div className="text-xs text-slate-400 mb-3">Sorgu: <span className="font-medium text-slate-600">{result.query}</span></div>
          <div className="bg-white border border-slate-200 rounded-xl px-6 py-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Agent Yanıtı</h2>
            <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
              {result.answer}
            </pre>
          </div>
        </div>
      )}

      {!loading && !result && !error && (
        <div className="mt-8 text-center text-slate-300 text-sm">
          Sonuçlar burada görünecek
        </div>
      )}
    </div>
  )
}
