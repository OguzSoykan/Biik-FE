import { useState } from 'react'
import toast from 'react-hot-toast'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const execute = async (apiFn, ...args) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiFn(...args)
      setData(response.data)
      return response.data
    } catch (err) {
      const message =
        err.response?.data?.detail || err.message || 'Bir hata oluştu'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, data, execute }
}
