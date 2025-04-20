
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <div className="relative min-h-[600px] flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background grid - simulates a cyberpunk grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 grid grid-cols-[repeat(40,1fr)] grid-rows-[repeat(20,1fr)]">
          {Array.from({ length: 40 * 20 }).map((_, i) => (
            <div
              key={i}
              className="border-[0.5px] border-cyber-purple/10"
              style={{
                opacity: Math.random() * 0.3 + 0.1,
              }}
            />
          ))}
        </div>
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyber-background via-transparent to-cyber-background z-10"></div>

      <div className="cyber-container relative z-20 px-4 py-12 text-center">
        <h1 className="font-orbitron text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6">
          <span className="text-cyber-purple cyber-text-glow">Cyber</span>
          <span className="text-cyber-cyan">Safe</span>
          <span className="block mt-2 text-cyber-light">Knowledge Hub</span>
        </h1>

        <p className="text-xl md:text-2xl text-cyber-light/80 max-w-3xl mx-auto mb-8">
          A <span className="text-cyber-cyan">secure</span> community forum where users share experiences 
          and experts provide cybersecurity <span className="text-cyber-purple">guidance</span>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="cyber-button text-lg px-8 py-6">
            <Link to="/forum">
              Browse Forum
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-cyber-cyan text-cyber-cyan hover:text-cyber-background hover:bg-cyber-cyan text-lg px-8 py-6 transition-all">
            <Link to="/tools">
              Explore Tools
            </Link>
          </Button>
        </div>
      </div>

      {/* Animated nodes in the background */}
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              backgroundColor: i % 3 === 0 ? '#8000FF' : i % 3 === 1 ? '#00FFFF' : '#FF3366',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: `0 0 10px ${i % 3 === 0 ? '#8000FF' : i % 3 === 1 ? '#00FFFF' : '#FF3366'}`,
              animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
