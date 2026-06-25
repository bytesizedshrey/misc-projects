
import { motion } from "framer-motion";

interface ConnectionProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  secure: boolean;
}

const Connection = ({ from, to, secure }: ConnectionProps) => {
  // Center position of each node
  const fromCenter = {
    x: from.x + 10, // Half of the node width
    y: from.y + 10, // Half of the node height
  };
  
  const toCenter = {
    x: to.x + 10,
    y: to.y + 10,
  };
  
  // Calculate distance and angle for the line
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {/* Line */}
      <div
        style={{
          position: 'absolute',
          left: fromCenter.x,
          top: fromCenter.y,
          width: distance,
          height: 2,
          backgroundColor: secure ? '#6FCF97' : '#EB5757',
          transformOrigin: 'left center',
          transform: `rotate(${angle}deg)`,
        }}
      >
        {/* Animated data packet */}
        <motion.div
          className={`packet ${secure ? 'packet-secure' : 'packet-compromised'}`}
          style={{
            '--travel-x': `${distance}px`,
            '--travel-y': '0px'
          } as React.CSSProperties}
          animate={{
            x: [0, distance],
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        />
      </div>
    </div>
  );
};

export default Connection;
