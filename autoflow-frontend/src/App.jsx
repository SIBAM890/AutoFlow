import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// 1. Import your new Landing Page
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      {/* 2. Style Update: Removed 'bg-gray-50 text-gray-900' from this wrapper.
         Since LandingPage is dark and Dashboard is light, we let each page 
         handle its own background colors individually.
      */}
      <div className="min-h-screen font-sans">
        <Routes>
          {/* 3. Public Route: The Landing Page is now the default entry point */}
          <Route path="/" element={<LandingPage />} />

          {/* Protected Route: Dashboard moved to its own path */}
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/builder" element={<Builder />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;