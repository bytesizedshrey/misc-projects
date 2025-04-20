
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  downloadUrl: string;
}

// Sample tools data
const featuredTools: Tool[] = [
  {
    id: '1',
    name: 'SecurePass',
    category: 'Password Manager',
    description: 'Open-source password manager with strong encryption and cross-platform support.',
    icon: '🔒',
    downloadUrl: 'https://example.com/securepass',
  },
  {
    id: '2',
    name: 'NetGuardian',
    category: 'Privacy',
    description: 'Ad and tracker blocker that protects your privacy while browsing.',
    icon: '🛡️',
    downloadUrl: 'https://example.com/netguardian',
  },
  {
    id: '3',
    name: 'EmailShield',
    category: 'Email Security',
    description: 'Tool to verify email authenticity and detect phishing attempts.',
    icon: '✉️',
    downloadUrl: 'https://example.com/emailshield',
  }
];

export function FeaturedTools() {
  return (
    <section className="py-16 bg-gradient-to-b from-cyber-background to-cyber-dark">
      <div className="cyber-container px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-cyber-light">
            <span className="text-cyber-cyan">Featured</span> Tools
          </h2>
          <Button asChild variant="outline" className="mt-4 md:mt-0 border-cyber-purple text-cyber-purple hover:bg-cyber-purple hover:text-cyber-light">
            <Link to="/tools">View All Tools</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredTools.map((tool) => (
            <div 
              key={tool.id} 
              className="cyber-panel relative group hover:border-cyber-cyan transition-all duration-300 overflow-hidden"
            >
              {/* Background animation effect */}
              <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-cyber-purple to-cyber-cyan bg-[length:400%] animate-[gradient_15s_ease_infinite] -z-10"></div>
              
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-3" role="img" aria-label={tool.category}>
                  {tool.icon}
                </span>
                <div>
                  <h3 className="font-orbitron text-xl font-bold text-cyber-light">{tool.name}</h3>
                  <span className="text-sm text-cyber-cyan">{tool.category}</span>
                </div>
              </div>
              
              <p className="text-cyber-light/80 mb-6">
                {tool.description}
              </p>
              
              <div className="flex justify-between items-center">
                <a 
                  href={tool.downloadUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="cyber-button text-sm py-1"
                >
                  Download
                </a>
                <Link 
                  to={`/tools/${tool.id}`}
                  className="text-cyber-cyan hover:text-cyber-purple underline text-sm"
                >
                  Learn More
                </Link>
              </div>
              
              {/* Corner decoration */}
              <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                <div className="absolute transform rotate-45 bg-cyber-purple text-cyber-light shadow-lg text-xs font-orbitron font-bold py-1 right-[-40px] top-[6px] w-[170%] text-center">
                  FREE
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
