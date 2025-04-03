import React, { useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface AIModel {
  id: string;
  modelName: string;
  promptTemplate: string;
}

interface WorkflowFlowProps {
  aiModels: AIModel[];
}

// Custom node component with explicit connection handles
const CustomNode = ({ data }: { data: { label: string; promptTemplate: string } }) => {
  return (
    <div
      style={{
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        background: '#fff',
        textAlign: 'center',
        minWidth: '150px',
      }}
    >
      {/* Top handle: Target for incoming connections */}
      <Handle
        type="target"
        position="top"
        id="target"
        isConnectable={true}
        style={{ background: '#555', width: '10px', height: '10px' }}
      />
      <div>
        <h3 style={{ color: '#6C47FF', margin: 0 }}>{data.label}</h3>
        <p style={{ fontSize: '12px', margin: 0 }}>{data.promptTemplate}</p>
      </div>
      {/* Bottom handle: Source for outgoing connections */}
      <Handle
        type="source"
        position="bottom"
        id="source"
        isConnectable={true}
        style={{ background: '#555', width: '10px', height: '10px' }}
      />
    </div>
  );
};

const WorkflowFlow: React.FC<WorkflowFlowProps> = ({ aiModels }) => {
  // Create nodes from the aiModels data
  const initialNodes = aiModels.map((model, index) => ({
    id: model.id,
    type: 'custom',
    data: { label: model.modelName, promptTemplate: model.promptTemplate },
    position: { x: index * 250 + 50, y: 100 },
  }));

  // Use React Flow hooks to manage node and edge state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Called when the user manually creates a connection between nodes
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ height: '500px', width: '100%', border: '1px solid #ddd' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={{ custom: CustomNode }}
        fitView
        connectionLineType="bezier"
      >
        <MiniMap nodeStrokeColor={(n) => '#6C47FF'} nodeColor={(n) => '#fff'} />
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default WorkflowFlow;
