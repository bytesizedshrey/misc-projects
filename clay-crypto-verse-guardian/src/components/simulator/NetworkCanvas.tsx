
import { useState } from "react";
import { useDrop } from "react-dnd";
import NetworkNode, { NodeType } from "../nodes/NetworkNode";
import Connection from "./Connection";

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

interface NetworkCanvasProps {
  nodes: NodeData[];
  connections: ConnectionData[];
  onNodeAdd: (node: NodeData) => void;
  onNodeMove: (id: string, position: { x: number; y: number }) => void;
  onNodeSelect: (id: string) => void;
  onConnectionAdd: (from: string, to: string) => void;
}

const NetworkCanvas = ({
  nodes,
  connections,
  onNodeAdd,
  onNodeMove,
  onNodeSelect,
  onConnectionAdd,
}: NetworkCanvasProps) => {
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "new-node",
      drop: (item: { type: NodeType }, monitor) => {
        const offset = monitor.getClientOffset();
        if (offset) {
          // Get position relative to drop target
          const canvasBounds = document.getElementById("network-canvas")?.getBoundingClientRect();
          if (canvasBounds) {
            const x = offset.x - canvasBounds.left;
            const y = offset.y - canvasBounds.top;
            
            onNodeAdd({
              id: `${item.type}-${Date.now()}`,
              type: item.type,
              position: { x, y },
            });
          }
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [onNodeAdd]
  );

  const handleNodeClick = (id: string) => {
    if (connectingFrom === null) {
      setConnectingFrom(id);
    } else if (connectingFrom !== id) {
      onConnectionAdd(connectingFrom, id);
      setConnectingFrom(null);
    } else {
      setConnectingFrom(null);
    }
    
    onNodeSelect(id);
  };

  const getNodeById = (id: string) => {
    return nodes.find(node => node.id === id);
  };

  return (
    <div 
      ref={drop} 
      id="network-canvas"
      className={`network-canvas rounded-xl ${isOver ? 'bg-clay-purple/5' : ''}`}
    >
      {/* Display all connections */}
      {connections.map(connection => {
        const fromNode = getNodeById(connection.from);
        const toNode = getNodeById(connection.to);
        
        if (!fromNode || !toNode) return null;
        
        return (
          <Connection
            key={connection.id}
            from={fromNode.position}
            to={toNode.position}
            secure={connection.secure}
          />
        );
      })}
      
      {/* Display all nodes */}
      {nodes.map(node => (
        <NetworkNode
          key={node.id}
          id={node.id}
          type={node.type}
          position={node.position}
          onDragEnd={onNodeMove}
          onNodeClick={handleNodeClick}
        />
      ))}
      
      {/* Connection indicator */}
      {connectingFrom && (
        <div className="absolute top-0 left-0 right-0 p-3 bg-clay-purple text-white text-center rounded-t-xl">
          Select another node to create a connection or click the same node to cancel
        </div>
      )}
    </div>
  );
};

export default NetworkCanvas;
