
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  downloadUrl: string;
  tags: string[];
  difficulty: string;
  platform: string[];
}

// Sample tools data
const toolsData: Tool[] = [
  {
    id: '1',
    name: 'SecurePass',
    category: 'Password Manager',
    description: 'Open-source password manager with strong encryption and cross-platform support. Features include password generation, secure storage, and browser integration.',
    icon: '🔒',
    downloadUrl: 'https://example.com/securepass',
    tags: ['passwords', 'security', 'encryption'],
    difficulty: 'Beginner',
    platform: ['Windows', 'macOS', 'Linux', 'iOS', 'Android']
  },
  {
    id: '2',
    name: 'NetGuardian',
    category: 'Privacy',
    description: 'Ad and tracker blocker that protects your privacy while browsing. Blocks malicious scripts, unwanted ads, and prevents tracking without slowing down your browsing experience.',
    icon: '🛡️',
    downloadUrl: 'https://example.com/netguardian',
    tags: ['privacy', 'adblock', 'browser'],
    difficulty: 'Beginner',
    platform: ['Windows', 'macOS', 'Linux']
  },
  {
    id: '3',
    name: 'EmailShield',
    category: 'Email Security',
    description: 'Tool to verify email authenticity and detect phishing attempts. Scans links and attachments for potential threats before you click on them.',
    icon: '✉️',
    downloadUrl: 'https://example.com/emailshield',
    tags: ['email', 'phishing', 'scanning'],
    difficulty: 'Beginner',
    platform: ['Windows', 'macOS']
  },
  {
    id: '4',
    name: 'DataVault',
    category: 'Encryption',
    description: 'File and folder encryption tool that uses military-grade encryption to secure your sensitive documents. Create encrypted containers for your private files.',
    icon: '🔐',
    downloadUrl: 'https://example.com/datavault',
    tags: ['encryption', 'files', 'privacy'],
    difficulty: 'Intermediate',
    platform: ['Windows', 'Linux']
  },
  {
    id: '5',
    name: 'VPNFreedom',
    category: 'Privacy',
    description: 'Open-source VPN client that works with various VPN providers. Protect your internet traffic from surveillance and access geo-restricted content.',
    icon: '🔗',
    downloadUrl: 'https://example.com/vpnfreedom',
    tags: ['vpn', 'privacy', 'networking'],
    difficulty: 'Intermediate',
    platform: ['Windows', 'macOS', 'Linux', 'Android']
  },
  {
    id: '6',
    name: 'SecureMessenger',
    category: 'Communication',
    description: 'End-to-end encrypted messaging app that ensures your conversations remain private. Features include self-destructing messages and secure file transfers.',
    icon: '💬',
    downloadUrl: 'https://example.com/securemessenger',
    tags: ['messaging', 'encryption', 'privacy'],
    difficulty: 'Beginner',
    platform: ['iOS', 'Android']
  },
  {
    id: '7',
    name: 'NetworkMonitor',
    category: 'Network Security',
    description: 'Monitor your local network for unauthorized devices and suspicious activities. Get alerted when new devices connect to your network.',
    icon: '📡',
    downloadUrl: 'https://example.com/networkmonitor',
    tags: ['network', 'monitoring', 'security'],
    difficulty: 'Advanced',
    platform: ['Windows', 'macOS', 'Linux']
  },
  {
    id: '8',
    name: 'PasswordAudit',
    category: 'Password Security',
    description: 'Check if your passwords have been exposed in data breaches without sending your actual passwords over the internet.',
    icon: '🔍',
    downloadUrl: 'https://example.com/passwordaudit',
    tags: ['passwords', 'audit', 'breaches'],
    difficulty: 'Beginner',
    platform: ['Web']
  }
];

// All available categories, platforms, and difficulties
const categories = ['All Categories', ...Array.from(new Set(toolsData.map(tool => tool.category)))];
const platforms = ['All Platforms', ...Array.from(new Set(toolsData.flatMap(tool => tool.platform)))];
const difficulties = ['All Levels', ...Array.from(new Set(toolsData.map(tool => tool.difficulty)))];

const Tools = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Levels');

  // Filter tools based on search and filters
  const filteredTools = toolsData.filter(tool => {
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All Categories' || tool.category === selectedCategory;
    const matchesPlatform = selectedPlatform === 'All Platforms' || tool.platform.includes(selectedPlatform);
    const matchesDifficulty = selectedDifficulty === 'All Levels' || tool.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesPlatform && matchesDifficulty;
  });

  return (
    <div className="min-h-screen flex flex-col bg-cyber-background">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="cyber-container px-4">
          <header className="mb-12">
            <div className="text-center mb-8">
              <h1 className="font-orbitron text-4xl md:text-5xl font-bold text-cyber-light mb-4">
                <span className="text-cyber-cyan">Cybersecurity</span> Tools
              </h1>
              <p className="text-cyber-light/80 max-w-2xl mx-auto">
                Browse our curated collection of free, open-source cybersecurity tools.
                These tools have been verified by our community experts for safety and effectiveness.
              </p>
            </div>
            
            <div className="cyber-panel p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search tools..."
                    className="cyber-input w-full rounded-md pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-cyber-purple absolute left-3 top-1/2 transform -translate-y-1/2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                
                <select 
                  className="cyber-input rounded-md bg-cyber-dark text-cyber-light border-cyber-purple"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select 
                  className="cyber-input rounded-md bg-cyber-dark text-cyber-light border-cyber-purple"
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                >
                  {platforms.map((platform) => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
                
                <select 
                  className="cyber-input rounded-md bg-cyber-dark text-cyber-light border-cyber-purple"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-cyber-light/70">
                  <span className="text-cyber-cyan font-semibold">{filteredTools.length}</span> tools found
                </p>
                <Button className="cyber-button">Submit New Tool</Button>
              </div>
            </div>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.length > 0 ? (
              filteredTools.map((tool) => (
                <div 
                  key={tool.id} 
                  className="cyber-panel relative group hover:border-cyber-cyan transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-3" role="img" aria-label={tool.category}>
                      {tool.icon}
                    </span>
                    <div>
                      <h3 className="font-orbitron text-xl font-bold text-cyber-light">{tool.name}</h3>
                      <span className="text-sm text-cyber-cyan">{tool.category}</span>
                    </div>
                  </div>
                  
                  <p className="text-cyber-light/80 mb-4">
                    {tool.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tool.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="text-xs bg-cyber-purple/20 text-cyber-purple px-2 py-0.5 rounded-full border border-cyber-purple/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-cyber-light/70">
                      <span className="font-medium">Difficulty:</span> {tool.difficulty}
                    </div>
                    <div className="text-sm text-cyber-light/70">
                      <span className="font-medium">Platforms:</span> {tool.platform.join(', ')}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <a 
                      href={tool.downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="cyber-button text-sm py-1"
                    >
                      Download
                    </a>
                    <Button variant="outline" className="text-cyber-cyan border-cyber-cyan hover:bg-cyber-cyan/10 text-sm py-1">
                      Details
                    </Button>
                  </div>
                  
                  {/* Free tag */}
                  <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                    <div className="absolute transform rotate-45 bg-cyber-purple text-cyber-light shadow-lg text-xs font-orbitron font-bold py-1 right-[-40px] top-[6px] w-[170%] text-center">
                      FREE
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="font-orbitron text-xl text-cyber-purple mb-2">No Tools Found</h3>
                <p className="text-cyber-light/70 mb-6">
                  No tools match your current search criteria. Try adjusting your filters.
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All Categories');
                    setSelectedPlatform('All Platforms');
                    setSelectedDifficulty('All Levels');
                  }}
                  className="cyber-button"
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
          
          <div className="mt-12 cyber-panel text-center py-8">
            <h3 className="font-orbitron text-2xl text-cyber-light mb-4">
              Don't see what you need?
            </h3>
            <p className="text-cyber-light/80 mb-6 max-w-2xl mx-auto">
              Our community is constantly expanding our tool database.
              Submit a tool suggestion or contribute to our open-source collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="cyber-button">Submit a Tool</Button>
              <Button variant="outline" className="border-cyber-purple text-cyber-purple hover:bg-cyber-purple/20">
                Contribute on GitHub
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Tools;
