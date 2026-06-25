
import { useState } from "react";
import { motion } from "framer-motion";
import { useDrag } from "react-dnd";
import { Computer, Server, AlertCircle } from "lucide-react";

export type NodeType = "server" | "client" | "attacker";

interface NetworkNodeProps {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  onDragEnd: (id: string, position: { x: number; y: number }) => void;
  onNodeClick: (id: string) => void;
}

const NodeTypeIcons = {
  server: Server,
  client: Computer,
  attacker: AlertCircle,
};

const NetworkNode = ({ id, type, position, onDragEnd, onNodeClick }: NetworkNodeProps) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: "node",
      item: { id, type },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
      end: (item, monitor) => {
        const delta = monitor.getDifferenceFromInitialOffset();
        if (delta) {
          const x = Math.round(position.x + delta.x);
          const y = Math.round(position.y + delta.y);
          onDragEnd(id, { x, y });
        }
        setIsDragging(false);
      },
    }),
    [id, position]
  );
  
  const IconComponent = NodeTypeIcons[type];
  const nodeClass = `clay-${type}`;
  
  return (
    <motion.div
      ref={dragRef}
      className={nodeClass}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        opacity,
        zIndex: isDragging ? 100 : 10,
      }}
      animate={{
        scale: isDragging ? 1.1 : 1,
      }}
      onClick={() => onNodeClick(id)}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="clay-node-inner">
        <IconComponent className="w-8 h-8 text-white" />
      </div>
    </motion.div>
  );
};

export default NetworkNode;
