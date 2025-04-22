import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Layout from "../components/Layout";
import NetworkCanvas from "../components/simulator/NetworkCanvas";
import NodePalette from "../components/simulator/NodePalette";
import SimulationControls from "../components/simulator/SimulationControls";
import InfoPanel from "../components/simulator/InfoPanel";
import { NodeType } from "../components/nodes/NetworkNode";

interface NodeData {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
}

interface ConnectionData {
  id: string;
  from: string;
  to: string;
  secure: boolean;
}

const Simulator = () => {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSecure, setIsSecure] = useState(false);
  const [hasAttack, setHasAttack] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  
  useEffect(() => {
    let timer: number;
    if (isRunning) {
      timer = window.setInterval(() => {
        setSimulationTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]);
  
  const handleAddNode = (node: NodeData) => {
    setNodes(prev => [...prev, node]);
  };
  
  const handleNodeMove = (id: string, position: { x: number; y: number }) => {
    setNodes(prev =>
      prev.map(node => (node.id === id ? { ...node, position } : node))
    );
  };
  
  const handleNodeSelect = (id: string) => {
    setSelectedNodeId(prev => (prev === id ? null : id));
  };
  
  const handlePaletteNodeSelect = (type: NodeType) => {
    // Create a node at a default position
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 100, y: 100 },
    };
    handleAddNode(newNode);
  };
  
  const handleAddConnection = (fromId: string, toId: string) => {
    // Check if connection already exists
    const connectionExists = connections.some(
      conn => (conn.from === fromId && conn.to === toId) || 
              (conn.from === toId && conn.to === fromId)
    );
    
    if (!connectionExists && fromId !== toId) {
      const newConnection = {
        id: `conn-${Date.now()}`,
        from: fromId,
        to: toId,
        secure: isSecure,
      };
      setConnections(prev => [...prev, newConnection]);
    }
  };
  
  const handleStartSimulation = () => {
    setIsRunning(true);
  };
  
  const handleStopSimulation = () => {
    setIsRunning(false);
  };
  
  const handleResetSimulation = () => {
    setIsRunning(false);
    setSimulationTime(0);
    // Keep the network structure but reset state
  };
  
  const handleToggleSecurity = () => {
    setIsSecure(prev => !prev);
    // Update connections to reflect new security state
    setConnections(prev => 
      prev.map(conn => ({
        ...conn,
        secure: !isSecure,
      }))
    );
  };
  
  const handleToggleAttack = () => {
    setHasAttack(prev => !prev);
  };
  
  const handleOpenSettings = () => {
    // This would open a settings modal in a full implementation
    alert("Settings would open here");
  };
  
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-clay-purple-dark to-clay-purple bg-clip-text text-transparent">
        Network Security Simulator
      </h1>
      
      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="clay-card p-2 mb-6">
              <NetworkCanvas
                nodes={nodes}
                connections={connections}
                onNodeAdd={handleAddNode}
                onNodeMove={handleNodeMove}
                onNodeSelect={handleNodeSelect}
                onConnectionAdd={handleAddConnection}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoPanel
                selectedNodeId={selectedNodeId}
                nodes={nodes}
                isSecure={isSecure}
                hasAttack={hasAttack}
                isRunning={isRunning}
                simulationTime={simulationTime}
              />
              
              <div className="clay-card">
                <h3 className="font-medium text-lg mb-4 text-clay-neutral-500">Educational Resources</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="block p-3 rounded-lg bg-clay-neutral-100 hover:bg-clay-purple/10 transition-colors">
                      <div className="font-medium mb-1">TLS Handshake Process</div>
                      <p className="text-sm text-clay-neutral-300">Learn how TLS establishes secure connections</p>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="block p-3 rounded-lg bg-clay-neutral-100 hover:bg-clay-purple/10 transition-colors">
                      <div className="font-medium mb-1">Understanding MITM Attacks</div>
                      <p className="text-sm text-clay-neutral-300">How attackers intercept communications</p>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="block p-3 rounded-lg bg-clay-neutral-100 hover:bg-clay-purple/10 transition-colors">
                      <div className="font-medium mb-1">Public Key Cryptography</div>
                      <p className="text-sm text-clay-neutral-300">Asymmetric encryption explained</p>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <NodePalette onNodeSelect={handlePaletteNodeSelect} />
            
            <SimulationControls
              isRunning={isRunning}
              isSecure={isSecure}
              hasAttack={hasAttack}
              onStartSimulation={handleStartSimulation}
              onStopSimulation={handleStopSimulation}
              onResetSimulation={handleResetSimulation}
              onToggleSecurity={handleToggleSecurity}
              onToggleAttack={handleToggleAttack}
              onOpenSettings={handleOpenSettings}
            />
          </div>
        </div>
      </DndProvider>
    </Layout>
  );
};

export default Simulator;
