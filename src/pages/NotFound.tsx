
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-cyber-background">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="cyber-panel max-w-lg w-full text-center py-12 px-8">
          <div className="text-9xl font-orbitron text-cyber-purple animate-glow mb-4">404</div>
          <h1 className="text-4xl font-orbitron text-cyber-cyan mb-6">Network Node Not Found</h1>
          <p className="text-cyber-light/80 mb-8">
            The cybersecurity hub node you're searching for appears to be offline or encrypted.
          </p>
          
          <div className="relative h-20 mb-8">
            <div className="absolute inset-0 flex justify-center">
              <div className="w-0.5 h-full bg-gradient-to-b from-cyber-purple to-cyber-cyan"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-cyber-purple animate-pulse"></div>
          </div>
          
          <Button asChild className="cyber-button">
            <Link to="/">Return to Main Grid</Link>
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
