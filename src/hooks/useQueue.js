import { useContext } from 'react'
import { QueueContext } from '../context/queue-context'

export function useQueue() {
  const ctx = useContext(QueueContext)
  if (!ctx) throw new Error('useQueue, QueueProvider içinde kullanılmalıdır')
  return ctx
}
