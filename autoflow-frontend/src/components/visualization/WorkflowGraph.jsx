import { useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CustomNode } from './CustomNode';

// Simple ID generator
const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const initialNodes = [
    {
        id: '1',
        position: { x: 100, y: 200 },
        data: { label: 'Your Agent', category: 'AutoFlow', type: 'trigger' },
        type: 'custom'
    },
];

const initialEdges = [];

export const WorkflowGraph = ({ workflowData }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const reactFlowInstance = useReactFlow();
    const reactFlowWrapper = useRef(null);

    // Register custom node types
    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

    // Handle initial workflow data from AI
    useEffect(() => {
        if (workflowData && workflowData.steps) {
            const aiNodes = workflowData.steps.map((step, index) => {
                // FORCE First Node to be the Agent
                if (index === 0) {
                    return {
                        id: step.id || generateId(),
                        type: 'custom',
                        position: { x: 50, y: 250 },
                        data: { label: 'Your Agent', category: 'AutoFlow' }
                    };
                }

                // Subsequent nodes: Position them in a fan/grid to the right
                // Alternating Y positions to show branching
                const yOffset = (index - 1) * 150;
                return {
                    id: step.id || generateId(),
                    type: 'custom',
                    position: { x: 450, y: 100 + yOffset },
                    data: {
                        label: step.data?.label || "AI Step",
                        type: step.type === 'trigger' ? 'trigger' : (step.data?.label?.includes('?') ? 'condition' : 'action')
                    },
                };
            });

            // Connect ALL nodes to the Central Agent (Index 0)
            // Use the specific bottom handles we added
            const agentId = aiNodes[0].id;
            const aiEdges = aiNodes.slice(1).map((node, i) => {
                // Distribute connections across the 3 bottom handles + right handle
                let handleId = 'right';
                if (i === 0) handleId = 'bottom-1';
                else if (i === 1) handleId = 'bottom-2';
                else if (i === 2) handleId = 'bottom-3';

                return {
                    id: `e${agentId}-${node.id}`,
                    source: agentId,
                    target: node.id,
                    sourceHandle: handleId,
                    targetHandle: 'left',
                    animated: true,
                    type: 'default',
                    style: { stroke: '#555', strokeWidth: 2 }
                };
            });

            setNodes(aiNodes);
            setEdges(aiEdges);
        }
    }, [workflowData, setNodes, setEdges]);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (typeof type === 'undefined' || !type) {
                return;
            }

            // Get viewport boundaries to calculate relative position correctly
            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            // Adjust for node center (approx half of w:200 h:70)
            position.x -= 100;
            position.y -= 35;

            const newNode = {
                id: generateId(),
                type: 'custom',
                position,
                data: {
                    label: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
                    type: type // 'trigger', 'action', 'condition', or tool ID like 'whatsapp'
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    return (
        <div
            className="w-full h-full bg-[#0a0a0a]"
            ref={reactFlowWrapper}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                defaultEdgeOptions={{ type: 'default', animated: true, style: { stroke: '#555', strokeWidth: 2 } }}
            >
                <Background color="#333" gap={24} size={1.5} variant="dots" />
                <Controls className="!bg-[#1e1e1e] !border-[#333] !fill-white [&>button]:!fill-gray-400 [&>button:hover]:!fill-white" />
            </ReactFlow>
        </div>
    );
};
