import { useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster, toast } from 'react-hot-toast'
import Navbar from './components/Navbar'
import CVManager from './pages/CVManager'
import CandidatePool from './pages/CandidatePool'
import Search from './pages/Search'
import { JobsContext } from './context/JobsContext'
import { useJobPolling } from './hooks/useJobPolling'

export default function App() {
  const handleConnectionError = useCallback(() => {
    toast.error('Bağlantı sorunu — sunucuya ulaşılamıyor.', { id: 'conn-error' })
  }, [])

  const { jobs, loading, refetch } = useJobPolling(2000, handleConnectionError)

  return (
    <JobsContext.Provider value={{ jobs, loading, refetch }}>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<CVManager />} />
            <Route path="/havuz" element={<CandidatePool />} />
            <Route path="/arama" element={<Search />} />
          </Routes>
        </div>
        <Toaster position="bottom-right" />
      </BrowserRouter>
    </JobsContext.Provider>
  )
}
