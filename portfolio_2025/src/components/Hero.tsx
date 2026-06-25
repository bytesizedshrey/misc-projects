
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { NeumorphicText, NeumorphicBox } from './ui/neumorphic';
import { Terminal, MatrixRain } from './ui/terminal';
import { CyberGrid, IsometricIcon } from './ui/cyber-elements';

export default function Hero() {
  const [hasTyped, setHasTyped] = useState(false);
  
  return (
    <div className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background effects */}
      <CyberGrid animate={true} />
      <MatrixRain density={30} className="opacity-10" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Text content */}
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h4 className="text-cyber-neon-green font-mono mb-2">Shreyash Gajbhiye_</h4>
            <NeumorphicText variant="h1" className="text-shadow-neon" glowing>
              Cybersecurity 
              <br />
              <span className="text-cyber-neon-purple">Professional</span>
            </NeumorphicText>
            
            <div className="h-12 my-4">
              <TypeAnimation
                sequence={[
                  'Network Security ',
                  1000,
                  'CyberSecurity',
                  1000,
                  () => setHasTyped(true)
                ]}
                wrapper="span"
                cursor={true}
                repeat={2}
                className="text-xl md:text-2xl font-cyber text-cyber-neon-blue"
              />
            </div>
            
            <motion.p 
              className="text-gray-300 mb-8 max-w-lg leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: hasTyped ? 1 : 0 }}
              transition={{ delay: 0.5 }}
            >
              Securing digital realms and hunting vulnerabilities. Passionate about network security, 
              and building defensive systems against ever-evolving cyber threats.
            </motion.p>
            
            <motion.div 
              className="flex gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: hasTyped ? 1 : 0 }}
              transition={{ delay: 0.7 }}
            >
              <NeumorphicBox 
                className="bg-cyber-darker bg-opacity-70 px-6 py-3 border border-cyber-neon-purple hover:border-cyber-neon-blue transition-colors"
                hoverEffect
              >
                <a href="#projects" className="font-cyber text-white">
                  View Projects
                </a>
              </NeumorphicBox>
              
              <NeumorphicBox 
                className="bg-cyber-darker bg-opacity-70 px-6 py-3 border border-cyber-neon-green hover:border-cyber-neon-blue transition-colors"
                hoverEffect
              >
                <a href="#contact" className="font-cyber text-white">
                  Contact Me
                </a>
              </NeumorphicBox>
            </motion.div>
          </motion.div>
          
          {/* Terminal & Isometric objects */}
          <motion.div 
            className="lg:w-1/2 relative h-[420px] perspective-[1000px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Terminal 
              className="w-full max-w-lg mb-8 shadow-neon-blue z-10"
              title="profile@cybersec:~$"
              autoType
              typingDelay={20}
            >
{`> Initializing security protocols...
> Running background check...
> IDENTITY VERIFIED
> Access granted to CyberProfile v1.0

SKILLS:
- Python Programming    [███████░░░]  70%
- Network Security      [████████░░]  80%
- JavaScript            [███████░░░]  70%
- Swift                 [█████████░]  90%
- Cryptography          [████████░░]  80%

CERTIFICATIONS:
-  Pre Security -> TryHackMe
-  Foundation of Cybersecurity -> Coursera
-  ISC2 Candidate -> ISC
-  Python -> Coursera 

STATUS: Excited for cybersecurity challenges...
`}
            </Terminal>
            
            {/* Floating isometric icons */}
            <div className="absolute -bottom-10 -right-10 transform-gpu">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <IsometricIcon 
                  icon="shield" 
                  size={80}
                  color="hsl(var(--neon-purple))"
                />
              </motion.div>
            </div>
            
            <div className="absolute top-20 -right-5 transform-gpu">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3, 
                  ease: "easeInOut",
                  delay: 1.2 
                }}
              >
                <IsometricIcon 
                  icon="lock" 
                  size={60}
                  color="hsl(var(--terminal-green))"
                />
              </motion.div>
            </div>
            
            <div className="absolute top-40 left-10 transform-gpu">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 5, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <IsometricIcon 
                  icon="terminal" 
                  size={70}
                  color="hsl(var(--neon-blue))"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
