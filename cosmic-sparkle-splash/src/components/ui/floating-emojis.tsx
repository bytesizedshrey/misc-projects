
import React from 'react';

export const FloatingEmojis = () => {
  const emojis = ['🤖', '💻', '🚀', '⚡', '🔮', '✨', '💡', '🎮'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {emojis.map((emoji, index) => (
        <div
          key={index}
          className="absolute animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            fontSize: `${Math.random() * 2 + 1}rem`,
            opacity: 0.3
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};
