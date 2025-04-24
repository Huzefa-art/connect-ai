import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  Handle,
  Position,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  ConnectionLineType,
  MarkerType,
  useUpdateNodeInternals,
} from 'reactflow';import 'reactflow/dist/style.css';
import { fetchData } from "@/utils/api";

interface AIModel {
  id: string;
  modelName: string;
  provider: string;
  promptTemplate: string;

}

interface Platform {
  id:string
  platformName: string
}
interface UploadedDocs {
  id:string
  docName:string
}
interface WorkflowFlowProps {
  aiModels: AIModel[];
  platforms: Platform[];
  uploadedDocs:  UploadedDocs[];
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;

}
const CustomNode = ({ id, data }: { id: string; data: any }) => {
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);
  
  const handleStyle = {
    background: '#6C47FF',
    width: '16px', // Increased width for better visibility
    height: '16px', // Increased height
    borderRadius: '50%',
    border: '2px solid white', // Optional: border to make it more visible
    cursor: 'pointer', // To indicate it's interactable
  };
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    data.setData((prev: any) =>
      prev.map((node: any) =>
        node.id === id
          ? { ...node, data: { ...node.data, systemPrompt: e.target.value } }
          : node
      )
    );
  };

  const isUserNode = data.label === 'User';

  return (
    <div
      style={{
        padding: '12px',
        border: '1px solid #6C47FF',
        borderRadius: '8px',
        background: '#fff',
        minWidth: '220px',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} id="top" style={handleStyle} isConnectable={true} />
      <Handle type="source" position={Position.Right} id="right" style={handleStyle} isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={handleStyle} isConnectable={true} />
      <Handle type="target" position={Position.Left} id="left" style={handleStyle} isConnectable={true} />

      {/* Node Title */}
      <h3 style={{ color: '#6C47FF', margin: '0 0 8px', fontWeight: 'bold', fontSize: '16px' }}>
        {data.label}
      </h3>

      {/* Editable Prompt (if not User) */}
      {/* {!isUserNode && ( */}
      {data.systemPrompt !== undefined && (
        <div style={{ textAlign: 'left' }}>
          <label
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#333',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            System Prompt:
          </label>
          <textarea
            value={data.systemPrompt}
            onChange={handlePromptChange}
            placeholder="Set system prompt"
            rows={3}
            style={{
              width: '100%',
              fontSize: '12px',
              padding: '6px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              resize: 'none',
            }}
          />
        </div>
      )}
    </div>
  );
};
const WorkflowFlow: React.FC<WorkflowFlowProps> = ({ aiModels, platforms, uploadedDocs,nodes, setNodes, edges, setEdges }) => {
  console.log("Received aiModels:", aiModels);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  // Update nodes when aiModels change
  useEffect(() => {
    const userNode = {
      id: 'user-node',
      type: 'custom',
      data: { label: 'User' },
      position: { x: 50, y: 50 },
    };
    const uploadedDocsNodes = uploadedDocs.map((model, index) => ({
      id: `doc-${model.id}`,
      type: 'custom',
      data: {
        label: model.docName,
        setData: setNodes,
      },
      position: { x: index * 250 + 50, y: 200 },
    })); 
    const platformNodes = platforms.map((model, index) => ({
      id: `platform-${model.id}`,
      type: 'custom',
      data: {
        label: model.platformName,
        setData: setNodes,
      },
      position: { x: index * 250 + 50, y: 200 },
    }));  
    
    const modelNodes = aiModels.map((model, index) => ({
      id: `ai-${model.id}`,
      type: 'custom',
      data: {
        label: model.modelName,
        systemPrompt: model.promptTemplate,
        provider: model.provider, 
        setData: setNodes,
      },
      position: { x: index * 250 + 50, y: 200 },
    }));

    setNodes([userNode, ...modelNodes, ...platformNodes, ...uploadedDocsNodes]);
  }, [aiModels, platforms, uploadedDocs, setNodes]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete') {
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
      }
    };
  
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setNodes, setEdges]);
  
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
  const idToNameMap = new Map(nodes.map((node) => [node.id, node.data.label]));

  // Function to call the API with the current workflow configuration
  const handleSetWorkflow = async () => {
    const workflowConfig = edges.map((edge) => ({
      from_: idToNameMap.get(edge.source),  // Get the name using the source ID
      to: idToNameMap.get(edge.target),     // Get the name using the target ID
    }));
    const nodesConfig = nodes.map((node) => ({
      id: node.id,
      name: node.data.label,
      provider: node.data.provider || null,
      systemPrompt: node.data.systemPrompt || null,
    }));
  
    const payload = {
      workflow: workflowConfig,
      nodes: nodesConfig,
    };
  

    try {
      // Make the API call with the payload
      console.log("▶️ Sending to /connect-platform:", payload);

      const result = await fetchData("api/v1/set-workflow", "POST", payload);
  
      if (result) {
        console.log("Workflow saved:", result);
        alert("Workflow configuration sent successfully!");
      } else {
        alert("Failed to send workflow configuration.");
      }
    } catch (error) {
      console.error("Error sending workflow:", error);
      alert("Failed to send workflow configuration.");
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
