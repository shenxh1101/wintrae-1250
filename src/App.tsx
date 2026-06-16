import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CalendarPage from './pages/Calendar';
import ShowDetailPage from './pages/ShowDetail';
import MaterialsPage from './pages/Materials';
import CommunicationsPage from './pages/Communications';
import SettlementPage from './pages/Settlement';

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-cream-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/shows/:id" element={<ShowDetailPage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/communications" element={<CommunicationsPage />} />
            <Route path="/settlement" element={<SettlementPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
