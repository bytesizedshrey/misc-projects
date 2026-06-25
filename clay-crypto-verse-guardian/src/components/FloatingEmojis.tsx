
import React from "react";

const EMOJIS = ["🛡️", "🔒", "👾", "🧑‍💻", "🦠", "💾", "📡"];
/**
 * Floats a set of cybersecurity-related emojis around randomly.
 */
const FloatingEmojis = () => {
  // Create an array of 8-10 floating emoji elements at random positions and animations
  return (
    <div className="pointer-events-none fixed inset-0 z-0 w-screen h-screen">
      {EMOJIS.map((emoji, idx) => {
        const top = Math.random() * 80 + 5;
        const left = Math.random() * 90 + 2;
        const duration = 6 + Math.random() * 8;
        const delay = Math.random() * 5;
        return (
          <span
            key={idx}
            className="absolute text-[2.1rem] md:text-4xl"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              animation: `emojiFloat ${duration}s ease-in-out ${delay}s infinite alternate`,
              opacity: 0.38 + 0.28 * Math.random(),
              filter: "drop-shadow(0 2px 4px rgba(50,50,50,0.10))",
              userSelect: "none"
            }}
          >
            {emoji}
          </span>
        );
      })}
      <style>
        {`
        @keyframes emojiFloat {
          0% { transform: translateY(0px) scale(1) rotate(0deg);}
          100% { transform: translateY(-28px) scale(1.1) rotate(12deg);}
        }
        `}
      </style>
    </div>
  );
};

export default FloatingEmojis;
