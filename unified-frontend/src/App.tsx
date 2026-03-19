import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import PlatformLayout from "./components/layout/PlatformLayout";
import Dashboard from "./pages/Dashboard";
import Studio from "./pages/Studio";

// Placeholder until full deploy page is built
const DeployAgent = () => (
  <div className="flex flex-col items-center justify-center h-full bg-[#0d0d0f] text-white gap-4">
    <img src="/favicon.png" className="w-12 h-12 invert opacity-80" />
    <h2 className="text-xl font-semibold">Deploy Agent</h2>
    <p className="text-gray-400 text-sm">This page is coming soon. Your agent configuration will appear here.</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Private Platform View */}
        <Route element={<PlatformLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/deploy-agent" element={<DeployAgent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
