
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { NodeType } from "../nodes/NetworkNode";

interface InfoPanelProps {
  selectedNodeId: string | null;
  nodes: Array<{ id: string; type: NodeType }>;
  isSecure: boolean;
  hasAttack: boolean;
  isRunning: boolean;
  simulationTime: number;
}

const InfoPanel = ({
  selectedNodeId,
  nodes,
  isSecure,
  hasAttack,
  isRunning,
  simulationTime,
}: InfoPanelProps) => {
  const selectedNode = nodes.find(node => node.id === selectedNodeId);
  
  const getProtocolInfo = () => {
    if (!isSecure) return "Unencrypted";
    return "TLS 1.3";
  };
  
  // Security status with animation
  const getSecurityStatus = () => {
    if (!isRunning) return { status: "Not running", color: "text-clay-neutral-300" };
    if (isSecure && !hasAttack) return { status: "Secure", color: "text-clay-green" };
    if (hasAttack) return { status: "Under attack", color: "text-clay-red" };
    return { status: "Vulnerable", color: "text-clay-neutral-300" };
  };
  
  const securityStatus = getSecurityStatus();
  
  // Get educational message based on current state
  const getEducationalMessage = () => {
    if (!isRunning) return "Start the simulation to see network traffic.";
    
    if (!isSecure && hasAttack) {
      return "Without encryption, attackers can easily intercept and read your data. TLS provides encryption that protects data in transit.";
    }
    
    if (isSecure && hasAttack) {
      return "Even with TLS encryption, attackers can attempt to intercept traffic, but they cannot decrypt the contents without the proper keys.";
    }
    
    if (!isSecure && !hasAttack) {
      return "Your data is being transmitted in plaintext. Anyone monitoring the network can read it. Consider enabling encryption.";
    }
    
    return "Your connection is secure. Data is encrypted using TLS, making it unreadable to anyone without the proper keys.";
  };

  return (
    <div className="clay-card">
      <h3 className="font-medium text-lg mb-4 text-clay-neutral-500">Network Information</h3>
      
      <div className="mb-4">
        <div className="mb-2 text-sm text-clay-neutral-300">Security Status</div>
        <div className="flex items-center gap-2">
          {securityStatus.status === "Secure" ? (
            <CheckCircle className={`w-5 h-5 ${securityStatus.color}`} />
          ) : securityStatus.status === "Under attack" ? (
            <AlertCircle className={`w-5 h-5 ${securityStatus.color}`} />
          ) : (
            <Info className={`w-5 h-5 ${securityStatus.color}`} />
          )}
          <span className={`font-medium ${securityStatus.color}`}>{securityStatus.status}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="mb-1 text-sm text-clay-neutral-300">Protocol</div>
          <div className="font-medium">{getProtocolInfo()}</div>
        </div>
        <div>
          <div className="mb-1 text-sm text-clay-neutral-300">Simulation Time</div>
          <div className="font-medium">{simulationTime}s</div>
        </div>
      </div>
      
      {selectedNode && (
        <div className="mb-4 p-3 bg-clay-neutral-100 rounded-lg">
          <div className="text-sm text-clay-neutral-300 mb-1">Selected Node</div>
          <div className="font-medium capitalize">{selectedNode.type}: {selectedNode.id}</div>
        </div>
      )}
      
      <motion.div 
        className="bg-clay-neutral-100 p-3 rounded-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-clay-blue" />
          <div className="text-sm font-medium">Educational Insight</div>
        </div>
        <p className="text-sm text-clay-neutral-400">{getEducationalMessage()}</p>
      </motion.div>
    </div>
  );
};

export default InfoPanel;
