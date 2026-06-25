
import { useDrag } from "react-dnd";
import { motion } from "framer-motion";
import { Computer, Server, AlertCircle } from "lucide-react";
import { NodeType } from "../nodes/NetworkNode";

interface NodePaletteProps {
  onNodeSelect: (type: NodeType) => void;
}

const NodePalette = ({ onNodeSelect }: NodePaletteProps) => {
  const nodeTypes: { type: NodeType; icon: React.ElementType; label: string }[] = [
    { type: "server", icon: Server, label: "Server" },
    { type: "client", icon: Computer, label: "Client" },
    { type: "attacker", icon: AlertCircle, label: "Attacker" },
  ];

  return (
    <div className="clay-card p-4">
      <h3 className="font-medium text-lg mb-4 text-clay-neutral-500">Network Components</h3>
      <div className="flex flex-col gap-4">
        {nodeTypes.map(({ type, icon: Icon, label }) => (
          <DraggableNodeButton 
            key={type} 
            type={type} 
            icon={Icon} 
            label={label}
            onNodeSelect={onNodeSelect} 
          />
        ))}
      </div>
    </div>
  );
};

interface DraggableNodeButtonProps {
  type: NodeType;
  icon: React.ElementType;
  label: string;
  onNodeSelect: (type: NodeType) => void;
}

const DraggableNodeButton = ({ type, icon: Icon, label, onNodeSelect }: DraggableNodeButtonProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "new-node",
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const nodeClass = `clay-${type}`;

  return (
    <motion.div
      ref={drag}
      className="flex items-center gap-3 cursor-grab p-2 rounded-lg hover:bg-white/20 transition-colors"
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={() => onNodeSelect(type)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={nodeClass} style={{ width: 40, height: 40 }}>
        <div className="clay-node-inner">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <span className="text-sm font-medium">{label}</span>
    </motion.div>
  );
};

export default NodePalette;
