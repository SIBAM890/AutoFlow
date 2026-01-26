import { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { ChatInterface } from '../components/builder/ChatInterface';
import { WorkflowGraph } from '../components/visualization/WorkflowGraph';
import { AIExplanation } from '../components/builder/AIExplanation';
import { Modal } from '../components/ui/Modal';
import { TestMode } from '../components/simulation/TestMode';
import { NodePalette } from '../components/builder/NodePalette';
import { Play, ToggleLeft, ToggleRight, PenTool } from 'lucide-react';
import clsx from 'clsx';

const Builder = () => {
    const [workflow, setWorkflow] = useState(null);
    const [isTestOpen, setIsTestOpen] = useState(false);
    const [isCustomMode, setIsCustomMode] = useState(false);

    const handleWorkflowGenerated = (data) => {
        console.log("Workflow generated:", data);
        setWorkflow(data);
    };

    return (
        <div className="h-screen flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <h1 className="text-xl font-bold text-gray-900">AutoFlow Builder</h1>
                </div>
                <div className="flex items-center gap-4">

                    {/* Mode Toggle */}
                    <button
                        onClick={() => setIsCustomMode(!isCustomMode)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all duration-300",
                            isCustomMode
                                ? "bg-purple-50 text-purple-700 border-purple-200 shadow-md ring-2 ring-purple-100"
                                : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                        )}
                    >
                        {isCustomMode ? (
                            <>
                                <span className="relative flex h-2 w-2 mr-1">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                                </span>
                                <PenTool size={16} />
                                Customization Mode: ON
                            </>
                        ) : (
                            <>
                                <span className="h-2 w-2 rounded-full bg-gray-400 mr-1"></span>
                                Customization Mode: OFF
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => setIsTestOpen(true)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
                    >
                        <Play size={16} fill="currentColor" />
                        Test Logic
                    </button>
                </div>
            </header>
            <main className="flex-1 flex overflow-hidden">
                {/* Chat / Sidebar */}
                <div className="w-1/3 min-w-[350px] border-r border-gray-200 bg-white flex flex-col shadow-lg z-10">
                    <div className="p-4 border-b border-gray-100 font-medium bg-gray-50 text-gray-700">AI Assistant</div>
                    <div className="flex-1 overflow-hidden relative">
                        <ChatInterface onWorkflowGenerated={handleWorkflowGenerated} />
                    </div>
                </div>

                {/* Visual Canvas with Provider */}
                <ReactFlowProvider>
                    <div className="flex-1 bg-gray-50 relative flex transition-all duration-300">
                        <div className="flex-1 relative h-full">
                            <WorkflowGraph workflowData={workflow} />
                            {/* Floating Overlay for AI Explanation */}
                            <AIExplanation workflow={workflow} />
                        </div>

                        {/* Manual Builder Palette - Only visible in Custom Mode */}
                        <div className={clsx(
                            "transition-all duration-300 transform",
                            isCustomMode ? "w-64 translate-x-0 opacity-100" : "w-0 translate-x-full opacity-0 overflow-hidden"
                        )}>
                            <NodePalette />
                        </div>
                    </div>
                </ReactFlowProvider>
            </main>

            {/* Test Mode Modal */}
            <Modal
                isOpen={isTestOpen}
                onClose={() => setIsTestOpen(false)}
                title="Test & Simulation"
            >
                <TestMode />
            </Modal>
        </div>
    );
};

export default Builder;
