import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/layout/Navbar'
import { QueueProvider } from './context/QueueContext'
import CVManager from './pages/CVManager'
import CandidatePool from './pages/CandidatePool'
import Search from './pages/Search'
import Ilanlar from './pages/Ilanlar'
import IlanDetail from './pages/IlanDetail'

export default function App() {
  return (
    <BrowserRouter>
      <QueueProvider>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<CVManager />} />
            <Route path="/havuz" element={<CandidatePool />} />
            <Route path="/arama" element={<Search />} />
            <Route path="/ilanlar" element={<Ilanlar />} />
            <Route path="/ilanlar/:ilanId" element={<IlanDetail />} />
          </Routes>
        </div>
        <Toaster position="bottom-right" />
      </QueueProvider>
    </BrowserRouter>
  )
}
