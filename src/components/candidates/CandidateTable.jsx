export default function CandidateTable({ candidates, onSelect }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
          <tr>
            <th className="px-5 py-3 text-left">Ad Soyad</th>
            <th className="px-5 py-3 text-center">Yetenek</th>
            <th className="px-5 py-3 text-center">Şirket</th>
            <th className="px-5 py-3 text-center">Durum</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {candidates.map((c) => (
            <tr
              key={c.id}
              onClick={() => onSelect(c)}
              className="hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <td className="px-5 py-3 font-medium text-slate-800">{c.name}</td>
              <td className="px-5 py-3 text-center text-slate-600">{c.skillCount}</td>
              <td className="px-5 py-3 text-center text-slate-600">{c.companyCount}</td>
              <td className="px-5 py-3 text-center">
                <StatusBadge status={c.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    embedded: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    written: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    extracted: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  const label = {
    embedded: 'Embedded',
    written: 'Yazıldı',
    extracted: 'Extracted',
  }
  return (
    <span className={`inline-block border rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] || 'bg-slate-100 text-slate-500'}`}>
      {label[status] || status}
    </span>
  )
}
