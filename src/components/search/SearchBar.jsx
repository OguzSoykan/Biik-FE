export default function SearchBar({ value, onChange, onSubmit, disabled, placeholder }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit() }}
      className="flex gap-2"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Aday ara... örn: 5 yıl Python deneyimi olan backend geliştirici"}
        disabled={disabled}
        className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Ara
      </button>
    </form>
  )
}
