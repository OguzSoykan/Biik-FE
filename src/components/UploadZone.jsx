import { useRef, useState } from 'react'

export default function UploadZone({ onFilesSelected, disabled }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.name.endsWith('.pdf') || f.name.endsWith('.json')
    )
    if (files.length) onFilesSelected(files)
  }

  const handleChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length) onFilesSelected(files)
    e.target.value = ''
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors select-none
        ${dragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.json"
        multiple
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <div className="text-4xl mb-3">📄</div>
      <p className="text-slate-700 font-medium">PDF veya JSON dosyalarını sürükle & bırak</p>
      <p className="text-slate-400 text-sm mt-1">ya da tıklayarak seç — çoklu seçim desteklenir</p>
    </div>
  )
}
