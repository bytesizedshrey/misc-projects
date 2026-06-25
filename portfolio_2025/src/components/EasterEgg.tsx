
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from './ui/terminal';
import { Lock, Key, CheckCircle } from 'lucide-react';

export default function EasterEgg() {
  const [showHint, setShowHint] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  
  const secretCode = 'h4ckth3pl4n3t';
  
  useEffect(() => {
    // Listen for the konami code variation
    const keys: string[] = [];
    const konamiCode = ['h', 'a', 'c', 'k', 'e', 'r'];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.push(e.key.toLowerCase());
      if (keys.length > konamiCode.length) {
        keys.shift();
      }
      
      if (keys.join('') === konamiCode.join('')) {
        setShowHint(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    if (e.target.value.toLowerCase() === secretCode) {
      setIsUnlocked(true);
      setTimeout(() => {
        setShowEasterEgg(true);
      }, 1000);
    }
  };
  
  const closeHint = () => {
    setShowHint(false);
  };
  
  const closeEasterEgg = () => {
    setShowEasterEgg(false);
    setShowHint(false);
    setIsUnlocked(false);
    setInputValue('');
  };
  
  return (
    <>
      {/* Hidden hint that appears when konami code is typed */}
      <AnimatePresence>
        {showHint && !isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-5 right-5 z-50 bg-cyber-darkest border border-cyber-neon-purple rounded-md p-4 shadow-neon-purple max-w-xs"
          >
            <button 
              className="absolute top-2 right-2 text-gray-500 hover:text-white"
              onClick={closeHint}
            >
              &times;
            </button>
            
            <div className="flex items-center mb-3">
              <Lock size={16} className="text-cyber-neon-purple mr-2" />
              <h4 className="font-cyber text-cyber-neon-purple text-sm">Secret Terminal Found</h4>
            </div>
            
            <p className="text-gray-300 text-xs mb-3">
              You've discovered a hidden system. Enter the access code to unlock secret data.
            </p>
            
            <div className="flex mb-2">
              <input
                type="password"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Enter secret code"
                className="flex-1 bg-cyber-darkest border border-gray-700 text-white px-3 py-1 text-xs rounded-l focus:outline-none focus:border-cyber-neon-blue font-mono"
              />
              <button className="bg-cyber-neon-purple bg-opacity-20 border border-cyber-neon-purple text-cyber-neon-purple px-2 py-1 text-xs rounded-r">
                <Key size={12} />
              </button>
            </div>
            
            <p className="text-gray-500 text-xs italic">
              Hint: Secret codes are often found in "planet" configurations.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Easter egg content */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="w-full max-w-2xl"
            >
              <div className="relative">
                <button 
                  className="absolute top-2 right-3 text-gray-400 hover:text-white z-10"
                  onClick={closeEasterEgg}
                >
                  &times;
                </button>
                
                <Terminal
                  title="secure-vault@access-granted:~$"
                  showPrompt={false}
                  className="w-full shadow-neon-purple"
                >
                  <div className="p-4">
                    <div className="flex items-center mb-4">
                      <CheckCircle size={18} className="text-cyber-neon-green mr-2" />
                      <h3 className="font-cyber text-cyber-neon-green text-lg">Access Granted</h3>
                    </div>
                    
                    <p className="text-gray-300 mb-4">
                      Congratulations on discovering the secret terminal and unlocking the vault! As a reward, here's some extra information about the cybersecurity professional behind this portfolio.
                    </p>
                    
                    <div className="bg-cyber-darkest p-3 rounded-md mb-4">
                      <h4 className="font-cyber text-white mb-2 text-sm">Personal Achievements</h4>
                      <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                        <li>Discovered and responsibly disclosed 3 critical vulnerabilities in major web applications</li>
                        <li>Ranked in top 5% on HackTheBox platform</li>
                        <li>Contributor to open-source security tools like [REDACTED] and [REDACTED]</li>
                        <li>Completed advanced training in reverse engineering and exploit development</li>
                      </ul>
                    </div>
                    
                    <div className="bg-cyber-darkest p-3 rounded-md mb-4">
                      <h4 className="font-cyber text-white mb-2 text-sm">Hidden Skills</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-cyber-neon-blue">Blockchain Security</span>
                          <div className="w-full bg-gray-800 h-1.5 rounded-full mt-1">
                            <div className="bg-cyber-neon-blue h-full rounded-full" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                        <div>
                          <span className="text-cyber-neon-purple">Reverse Engineering</span>
                          <div className="w-full bg-gray-800 h-1.5 rounded-full mt-1">
                            <div className="bg-cyber-neon-purple h-full rounded-full" style={{ width: '90%' }}></div>
                          </div>
                        </div>
                        <div>
                          <span className="text-cyber-neon-green">OSINT</span>
                          <div className="w-full bg-gray-800 h-1.5 rounded-full mt-1">
                            <div className="bg-cyber-neon-green h-full rounded-full" style={{ width: '95%' }}></div>
                          </div>
                        </div>
                        <div>
                          <span className="text-red-400">Social Engineering</span>
                          <div className="w-full bg-gray-800 h-1.5 rounded-full mt-1">
                            <div className="bg-red-400 h-full rounded-full" style={{ width: '80%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="font-mono text-xs text-cyber-neon-green animate-pulse">
                      Congratulations on finding the Easter egg! There are more secrets hidden throughout the site...
                    </div>
                  </div>
                </Terminal>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
