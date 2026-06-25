
import { PlayCircle, StopCircle, RefreshCw, Shield, Shield as ShieldIcon, ShieldOff, Settings } from "lucide-react";
import { motion } from "framer-motion";

interface SimulationControlsProps {
  isRunning: boolean;
  isSecure: boolean;
  hasAttack: boolean;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  onResetSimulation: () => void;
  onToggleSecurity: () => void;
  onToggleAttack: () => void;
  onOpenSettings: () => void;
}

const SimulationControls = ({
  isRunning,
  isSecure,
  hasAttack,
  onStartSimulation,
  onStopSimulation,
  onResetSimulation,
  onToggleSecurity,
  onToggleAttack,
  onOpenSettings,
}: SimulationControlsProps) => {
  return (
    <div className="clay-card">
      <h3 className="font-medium text-lg mb-4 text-clay-neutral-500">Simulation Controls</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button 
          className={`clay-button flex items-center justify-center gap-2 ${isRunning ? 'bg-clay-red/20' : 'clay-button-primary'}`}
          onClick={isRunning ? onStopSimulation : onStartSimulation}
        >
          {isRunning ? (
            <>
              <StopCircle className="w-5 h-5" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <PlayCircle className="w-5 h-5" />
              <span>Start</span>
            </>
          )}
        </button>
        
        <button 
          className="clay-button flex items-center justify-center gap-2"
          onClick={onResetSimulation}
        >
          <RefreshCw className="w-5 h-5" />
          <span>Reset</span>
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Encryption</span>
          <motion.button 
            className={`p-2 rounded-lg ${isSecure ? 'bg-clay-green/20' : 'bg-clay-neutral-200'}`}
            onClick={onToggleSecurity}
            whileTap={{ scale: 0.95 }}
          >
            {isSecure ? (
              <Shield className="w-6 h-6 text-clay-green" />
            ) : (
              <ShieldOff className="w-6 h-6 text-clay-neutral-300" />
            )}
          </motion.button>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">MITM Attack</span>
          <motion.button 
            className={`p-2 rounded-lg ${hasAttack ? 'bg-clay-red/20' : 'bg-clay-neutral-200'}`}
            onClick={onToggleAttack}
            whileTap={{ scale: 0.95 }}
          >
            {hasAttack ? (
              <ShieldOff className="w-6 h-6 text-clay-red" />
            ) : (
              <ShieldIcon className="w-6 h-6 text-clay-neutral-300" />
            )}
          </motion.button>
        </div>
        
        <button 
          className="clay-button w-full flex items-center justify-center gap-2 mt-4"
          onClick={onOpenSettings}
        >
          <Settings className="w-5 h-5" />
          <span>Advanced Settings</span>
        </button>
      </div>
    </div>
  );
};

export default SimulationControls;
