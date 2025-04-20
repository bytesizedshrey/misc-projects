
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { CyberCanvas } from "@/components/CyberCanvas";
import { FeaturedTools } from "@/components/FeaturedTools";
import { ForumPreview } from "@/components/ForumPreview";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-cyber-background">
      <Navbar />
      
      <main className="flex-1">
        <HeroSection />
        
        <div className="relative h-[70vh] md:h-[80vh] mb-16">
          <div className="absolute top-4 left-0 right-0 z-10 text-center">
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-cyber-light mb-2">
              <span className="text-cyber-purple">Navigate</span> the Hub
            </h2>
            <p className="text-cyber-light/70 max-w-xl mx-auto">
              Click on the interactive nodes to explore different sections of the CyberSafe Knowledge Hub
            </p>
          </div>
          <CyberCanvas className="absolute inset-0" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyber-background to-transparent"></div>
        </div>
        
        <FeaturedTools />
        <ForumPreview />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
