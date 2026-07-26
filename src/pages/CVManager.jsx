import QueueItem from '../components/queue/QueueItem'
import QueueSummary from '../components/queue/QueueSummary'
import UploadZone from '../components/upload/UploadZone'
import { useQueue } from '../hooks/useQueue'

/**
 * CV Yönetimi — kuyruk state'i QueueProvider'da yaşar:
 * sekme değiştirmek ilerlemeyi kaybettirmez, işleme sürerken yeni dosya
 * eklenebilir, başarısız/yarıda kalanlar tek tek yeniden denenebilir.
 */
export default function CVManager() {
  const { items, uploading, enqueueFiles, retryItem } = useQueue()

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">CV Yönetimi</h1>
      <p className="text-slate-500 text-sm mb-8">
        CV yükleyin ve pipeline adımlarını takip edin. İşleme sürerken de yeni
        dosya ekleyebilirsiniz — sıraya alınır.
      </p>

      <UploadZone onFilesSelected={enqueueFiles} disabled={uploading} />

      {items.length > 0 && (
        <div className="mt-6 space-y-4">
          <QueueSummary />
          {items.map((item) => (
            <QueueItem key={item.filename} item={item} onRetry={retryItem} />
          ))}
        </div>
      )}
    </div>
  )
}
