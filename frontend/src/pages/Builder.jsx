import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import TopBar from '../components/layout/TopBar';
import { WorkflowGraph } from '../components/visualization/WorkflowGraph';
import NLInputPanel from '../components/panels/NLInputPanel';
import NodeConfigPanel from '../components/panels/NodeConfigPanel';
import AIExplainerPanel from '../components/panels/AIExplainerPanel';

export default function Builder() {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0a] overflow-hidden relative font-sans text-white">
      {/* C5: TopBar replaces original header */}
      <TopBar />
      
      <div className="flex-1 relative w-full h-full">
        <ReactFlowProvider>
          {/* Main Visual Canvas */}
          <WorkflowGraph />
          
          {/* C2: NL Input bottom bar */}
          <NLInputPanel />
          
          {/* C3: Config sidebar (conditional inside component) */}
          <NodeConfigPanel />
          
          {/* C4: AI Explainer popup (conditional inside component) */}
          <AIExplainerPanel />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
