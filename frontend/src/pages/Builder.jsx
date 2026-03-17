import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { WorkflowGraph } from '../components/visualization/WorkflowGraph';
import { ChatInterface } from '../components/builder/ChatInterface';
import { Zap, Play, Rocket, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Builder() {
  const [workflowData, setWorkflowData] = useState(null);
  const [customizationMode, setCustomizationMode] = useState(false);

  const navigate = useNavigate();

  const handleWorkflowGenerated = (workflow) => {
    setWorkflowData(workflow);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden font-sans">
      {/* ── Top Bar ───────────────────────────────────── */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-5 z-50 shrink-0">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
            <Zap size={16} className="text-white" fill="currentColor" />
          </div>
          <h1 className="text-[15px] font-bold text-gray-900 tracking-tight">AutoFlow Builder</h1>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* Customization Mode Toggle */}
          <button
            onClick={() => setCustomizationMode(!customizationMode)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:bg-gray-50"
            style={{
              borderColor: customizationMode ? '#22c55e' : '#d1d5db',
              color: customizationMode ? '#16a34a' : '#6b7280',
            }}
          >
            <span className={`w-2 h-2 rounded-full ${customizationMode ? 'bg-green-500' : 'bg-gray-400'}`} />
            Customization Mode: {customizationMode ? 'ON' : 'OFF'}
          </button>

          {/* Test Logic Button */}
          <button className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm">
            <Play size={14} fill="currentColor" />
            Test Logic
          </button>

          {/* Deploy Button */}
          <button
            onClick={() => navigate('/deploy-agent')}
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            <Rocket size={14} />
            Deploy
          </button>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar — AI Chat */}
        <div className="w-[320px] shrink-0 border-r border-gray-200 flex flex-col bg-white z-20">
          {/* Sidebar Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
            <h2 className="text-sm font-bold text-gray-800">AI Assistant</h2>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 overflow-hidden">
            <ChatInterface onWorkflowGenerated={handleWorkflowGenerated} />
          </div>
        </div>

        {/* Right — React Flow Canvas */}
        <div className="flex-1 relative">
          <ReactFlowProvider>
            <WorkflowGraph workflowData={workflowData} />
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
}
