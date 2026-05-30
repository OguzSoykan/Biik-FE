import { useState } from 'react'
import SearchBar from '../components/SearchBar'

export default function Search() {
  const [query, setQuery] = useState('')

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Arama</h1>
      <p className="text-slate-500 text-sm mb-8">
        Doğal dil ile aday arayın. GraphRAG tabanlı öneri motoru.
      </p>

      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={() => {}}
        disabled={true}
      />

      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl px-6 py-5 text-center">
        <div className="text-2xl mb-2">🚧</div>
        <h2 className="font-semibold text-amber-800 mb-1">Yakında Aktif Olacak</h2>
        <p className="text-amber-600 text-sm">
          Arama motoru Aşama 5 ve 6 tamamlandıktan sonra aktif hale gelecektir.
          <br />
          <span className="font-medium">LangGraph agent + GraphRAG pipeline</span> üzerinde çalışılıyor.
        </p>
      </div>

      <div className="mt-6 text-center text-slate-300 text-sm">
        Sonuçlar burada görünecek
      </div>
    </div>
  )
}
