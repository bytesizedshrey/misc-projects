import React, { useRef, useEffect } from 'react';

interface CircleNode {
  x: number;
  y: number;
  radius: number;
  color: string;
  speed: number;
  label: string;
  link: string;
  pulse: number;
}

interface CyberCanvasProps {
  className?: string;
}

export function CyberCanvas({ className = "" }: CyberCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    let mouseX = 0;
    let mouseY = 0;
    let hoverNode: CircleNode | null = null;

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Track mouse position for interactivity
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleClick = () => {
      if (hoverNode && hoverNode.link) {
        window.location.href = hoverNode.link;
      }
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    handleResize();

    // Create network nodes
    const nodes: CircleNode[] = [
      { x: canvas.width * 0.3, y: canvas.height * 0.3, radius: 40, color: '#8000FF', speed: 1, label: 'Forum', link: '/forum', pulse: 0 },
      { x: canvas.width * 0.7, y: canvas.height * 0.3, radius: 40, color: '#00FFFF', speed: 1.2, label: 'Tools', link: '/tools', pulse: Math.PI / 2 },
      { x: canvas.width * 0.5, y: canvas.height * 0.6, radius: 40, color: '#FF3366', speed: 0.8, label: 'About', link: '/about', pulse: Math.PI },
    ];

    // Connections between nodes
    const connections = [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 0 },
    ];

    // Animation loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update node positions with subtle floating motion
      const time = performance.now() * 0.001;
      nodes.forEach((node, index) => {
        node.y += Math.sin(time * node.speed) * 0.3;
        node.x += Math.cos(time * node.speed * 0.7) * 0.3;
        
        // Keep nodes within bounds
        if (node.x < node.radius) node.x = node.radius;
        if (node.x > canvas.width - node.radius) node.x = canvas.width - node.radius;
        if (node.y < node.radius) node.y = node.radius;
        if (node.y > canvas.height - node.radius) node.y = canvas.height - node.radius;
      });

      // Draw connections first (behind nodes)
      ctx.lineWidth = 2;
      connections.forEach(conn => {
        const from = nodes[conn.from];
        const to = nodes[conn.to];
        
        // Create gradient for connection
        const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
        gradient.addColorStop(0, from.color + '88'); // Semi-transparent
        gradient.addColorStop(1, to.color + '88');
        
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        
        // Add pulsing effect along the connection
        const pulseDot = time % 3; // Normalize to [0, 3]
        const pulsePosition = Math.min(pulseDot / 3, 1); // Normalize to [0, 1]
        const dotX = from.x + (to.x - from.x) * pulsePosition;
        const dotY = from.y + (to.y - from.y) * pulsePosition;
        
        ctx.beginPath();
        ctx.fillStyle = '#ffffff';
        ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Check if mouse is over any node
      hoverNode = null;
      for (const node of nodes) {
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < node.radius) {
          hoverNode = node;
          break;
        }
      }

      // Draw nodes
      nodes.forEach((node, i) => {
        const isHovered = node === hoverNode;
        
        // Outer glow effect
        const pulseSize = 1 + 0.2 * Math.sin(time * 2 + node.pulse);
        const outerRadius = node.radius * pulseSize;
        
        // Draw outer glow
        const gradient = ctx.createRadialGradient(
          node.x, node.y, node.radius * 0.8,
          node.x, node.y, outerRadius * 1.2
        );
        gradient.addColorStop(0, node.color + 'dd');
        gradient.addColorStop(1, node.color + '00');
        
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(node.x, node.y, outerRadius * 1.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw the main circle
        ctx.beginPath();
        ctx.fillStyle = isHovered ? '#ffffff' : node.color;
        ctx.arc(node.x, node.y, isHovered ? node.radius * 1.1 : node.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw inner glow
        const innerGradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius
        );
        innerGradient.addColorStop(0, '#ffffff');
        innerGradient.addColorStop(0.3, node.color);
        innerGradient.addColorStop(1, isHovered ? '#ffffff33' : node.color + '33');
        
        ctx.beginPath();
        ctx.fillStyle = innerGradient;
        ctx.arc(node.x, node.y, node.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw label
        ctx.font = isHovered ? 'bold 20px Orbitron' : '16px Orbitron';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isHovered ? '#ffffff' : '#f1f1f1';
        
        // Text shadow
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 10;
        ctx.fillText(node.label, node.x, node.y);
        ctx.shadowBlur = 0;
        
        // Change cursor when hovering
        canvas.style.cursor = isHovered ? 'pointer' : 'default';
      });

      // Request next frame
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    // Cleanup
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  return <canvas ref={canvasRef} className={`w-full h-full ${className}`} />;
}
