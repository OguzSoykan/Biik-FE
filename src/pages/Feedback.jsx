import { useEffect, useState } from 'react'
import { getFeedbackStats } from '../api'

export default function Feedback() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getFeedbackStats()
      .then((data) => setStats(data))
      .catch((e) => setError(e?.response?.data?.detail || e.message || 'Bir hata oluştu.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Geri Bildirim</h1>
      <p className="text-slate-500 text-sm mb-6">
        Arama sonuçlarındaki 👍/👎 oyları. Benzer sorgularda aday puanlarını en fazla ±5 puan etkiler.
      </p>

      {loading && (
        <div className="mt-10 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm">
          <strong>Hata:</strong> {error}
        </div>
      )}

      {stats && stats.stats.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-8 text-center text-slate-500 text-sm">
          Henüz geri bildirim yok. Arama sonuçlarındaki 👍/👎 butonlarını kullanın.
        </div>
      )}

      {stats && stats.stats.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs text-slate-400 uppercase tracking-wide">
                <th className="px-5 py-3 font-semibold">Aday</th>
                <th className="px-5 py-3 font-semibold text-center">👍</th>
                <th className="px-5 py-3 font-semibold text-center">👎</th>
                <th className="px-5 py-3 font-semibold text-center">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.stats.map((row) => (
                <tr key={row.aday_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-slate-700 font-medium">{row.aday_name}</td>
                  <td className="px-5 py-3 text-center text-emerald-600">{row.up}</td>
                  <td className="px-5 py-3 text-center text-red-500">{row.down}</td>
                  <td
                    className={`px-5 py-3 text-center font-semibold ${
                      row.net > 0 ? 'text-emerald-600' : row.net < 0 ? 'text-red-500' : 'text-slate-400'
                    }`}
                  >
                    {row.net > 0 ? `+${row.net}` : row.net}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
