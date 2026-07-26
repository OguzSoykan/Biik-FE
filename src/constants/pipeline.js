/** Pipeline adımları — QueueContext ve PipelineProgress'in ortak kaynağı. */
export const PIPELINE_STEPS = [
  { key: 'ingest', label: 'Yükleme' },
  { key: 'convert', label: 'Dönüştürme' },
  { key: 'extract', label: 'Extraction' },
  { key: 'embed', label: 'Embedding' },
  { key: 'write', label: "Memgraph'a Yazma" },
]

export const STEP_KEYS = PIPELINE_STEPS.map((s) => s.key)

export const QUEUE_STATUS = {
  QUEUED: 'queued',
  RUNNING: 'running',
  DONE: 'done',
  FAILED: 'failed',
  INTERRUPTED: 'interrupted', // sayfa yenilenince yarıda kalanlar
}
