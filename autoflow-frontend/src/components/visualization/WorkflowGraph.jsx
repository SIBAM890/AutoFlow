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
        // Support both "nodes" (new format) and "steps" (legacy/fallback)
        const incomingNodes = workflowData?.nodes || workflowData?.steps;

        if (incomingNodes && Array.isArray(incomingNodes) && incomingNodes.length > 0) {

            // MAP NODES
            const aiNodes = incomingNodes.map((node, index) => {
                const isFirst = index === 0;
                return {
                    id: node.id || generateId(),
                    type: 'custom',
                    // Use provided position or auto-layout
                    position: node.position || {
                        x: isFirst ? 50 : 450,
                        y: isFirst ? 250 : 100 + ((index - 1) * 150)
                    },
                    data: {
                        label: node.data?.label || node.label || "Step",
                        type: node.type || node.data?.type || (node.label?.includes('?') ? 'condition' : 'action'),
                        category: isFirst ? 'AutoFlow' : 'AI'
                    }
                };
            });

            // MAP EDGES
            // 1. Try to use explicit connections from backend (next/outputs/conditions)
            let aiEdges = [];
            const aiIds = aiNodes.map(n => n.id);

            incomingNodes.forEach((node, i) => {
                const sourceId = node.id || aiIds[i]; // Fallback to mapped ID if needed

                // A. Handle Linear "next"
                if (node.next && Array.isArray(node.next)) {
                    node.next.forEach(targetId => {
                        aiEdges.push({
                            id: `e${sourceId}-${targetId}`,
                            source: sourceId,
                            target: targetId,
                            sourceHandle: 'right',
                            targetHandle: 'left',
                            animated: true,
                            type: 'default'
                        });
                    });
                }

                // B. Handle Condition Branches (true_id / false_id)
                if (node.data?.true_id) {
                    aiEdges.push({
                        id: `e${sourceId}-${node.data.true_id}-yes`,
                        source: sourceId,
                        target: node.data.true_id,
                        sourceHandle: 'bottom', // Conditions usually split down
                        targetHandle: 'left',
                        label: 'Yes/True',
                        animated: true,
                        type: 'default',
                        style: { stroke: 'green' }
                    });
                }
                if (node.data?.false_id) {
                    aiEdges.push({
                        id: `e${sourceId}-${node.data.false_id}-no`,
                        source: sourceId,
                        target: node.data.false_id,
                        sourceHandle: 'right',
                        targetHandle: 'left',
                        label: 'No/False',
                        animated: true,
                        type: 'default',
                        style: { stroke: 'red' }
                    });
                }

                // C. Handle AI Agent Outputs (Map of intent -> nodeId)
                if (node.data?.outputs && typeof node.data.outputs === 'object') {
                    Object.entries(node.data.outputs).forEach(([intent, targetId]) => {
                        aiEdges.push({
                            id: `e${sourceId}-${targetId}-${intent}`,
                            source: sourceId,
                            target: targetId,
                            sourceHandle: 'right',
                            targetHandle: 'left',
                            label: intent,
                            animated: true,
                            type: 'default'
                        });
                    });
                }
            });

            // 2. Fallback: If no edges found, Connect LINEARLY (1->2->3)
            // This prevents the "Spider Web" mess if AI forgets connections.
            if (aiEdges.length === 0 && aiNodes.length > 1) {
                for (let i = 0; i < aiNodes.length - 1; i++) {
                    const current = aiNodes[i];
                    const next = aiNodes[i + 1];

                    aiEdges.push({
                        id: `e-fallback-${current.id}-${next.id}`,
                        source: current.id,
                        target: next.id,
                        sourceHandle: 'right',
                        targetHandle: 'left',
                        animated: true,
                        type: 'default',
                        style: { stroke: '#999', strokeDasharray: '5,5' } // Dashed line for implied connection
                    });
                }
            }

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
