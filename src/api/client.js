import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL

/**
 * Tek axios instance — tüm domain modülleri bunu kullanır.
 * Hata mesajları interceptor'da normalize edilir: çağıran taraf her zaman
 * err.userMessage üzerinden okunabilir Türkçe mesaj bulur.
 */
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120_000,
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    error.userMessage =
      error.response?.data?.detail ||
      (error.code === 'ECONNABORTED'
        ? 'İstek zaman aşımına uğradı.'
        : error.message) ||
      'Bir hata oluştu.'
    return Promise.reject(error)
  }
)

export default client
