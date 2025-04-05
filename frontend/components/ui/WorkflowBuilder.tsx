import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  Handle,
  Position,
  Connection,
  Edge,
  ConnectionLineType,
  MarkerType,
  useUpdateNodeInternals,
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

// Custom Node Component with handles on all four sides (each handle has a unique id)
const CustomNode = ({ id, data }: { id: string; data: { label: string } }) => {
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);

  const handleStyle = { background: '#6C47FF', width: '12px', height: '12px' };

  return (
    <div
      style={{
        padding: '10px',
        border: '1px solid #6C47FF',
        borderRadius: '5px',
        background: '#fff',
        textAlign: 'center',
        minWidth: '150px',
        position: 'relative',
      }}
    >
      {/* Top handle for incoming connections */}
      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        isConnectable={true}
        style={handleStyle}
      />
      {/* Right handle for outgoing connections */}
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        isConnectable={true}
        style={handleStyle}
      />
      {/* Bottom handle for outgoing connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        isConnectable={true}
        style={handleStyle}
      />
      {/* Left handle for incoming connections */}
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        isConnectable={true}
        style={handleStyle}
      />
      <div>
        <h3 style={{ color: '#6C47FF', margin: 0 }}>{data.label}</h3>
      </div>
    </div>
  );
};

const WorkflowFlow: React.FC<WorkflowFlowProps> = ({ aiModels }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Update nodes when aiModels change
  useEffect(() => {
    const userNode = {
      id: 'user-node',
      type: 'custom',
      data: { label: 'User' },
      position: { x: 50, y: 50 },
    };

    const modelNodes = aiModels.map((model, index) => ({
      id: model.id,
      type: 'custom',
      data: { label: model.modelName },
      position: { x: index * 250 + 50, y: 200 },
    }));

    setNodes([userNode, ...modelNodes]);
  }, [aiModels, setNodes]);

  // Handle manual connections (edges will have arrowheads by default)
  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'default',
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      ),
    [setEdges]
  );

  // Function to call the API with the current workflow configuration
  const handleSetWorkflow = async () => {
    // Create a workflow configuration array based on current edges
    const workflowConfig = edges.map((edge) => ({
      from: edge.source,
      to: edge.target,
    }));

    try {
      const response = await fetch('/api/set-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow: workflowConfig }),
      });

      if (!response.ok) {
        throw new Error('Failed to set workflow');
      }
      const result = await response.json();
      console.log('Workflow set successfully:', result);
      alert('Workflow set successfully!');
    } catch (error) {
      console.error('Error setting workflow:', error);
      alert('Error setting workflow');
    }
  };

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  return (
    <div style={{ height: '100%', width: '100%', padding: '10px' }}>
      {/* Button to trigger the API call */}
      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={handleSetWorkflow}
          style={{
            padding: '8px 16px',
            background: '#6C47FF',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Set Workflow
        </button>
      </div>

      <div style={{ height: '500px', width: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          connectionLineType={ConnectionLineType.Straight}
          defaultEdgeOptions={{
            type: 'default',
            markerEnd: { type: MarkerType.ArrowClosed },
          }}
        >
          <Background color="#aaa" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowFlow;
