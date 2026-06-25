
import React from 'react';
import { motion } from 'framer-motion';
import { NeumorphicText, NeumorphicBox, IsometricBox } from './ui/neumorphic';
import { Terminal, CommandLine } from './ui/terminal';
import { CyberIcon } from './ui/cyber-elements';

export default function About() {
  return (
    <section id="about" className="relative py-20 overflow-hidden">
      <div className="absolute top-0 inset-0 bg-cyber-grid bg-[length:50px_50px] opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center mb-16">
          <NeumorphicText variant="h2" className="text-center" glowing>
            <span className="text-cyber-neon-blue">./</span>whoami
            <span className="text-cyber-neon-green animate-terminal-blink">_</span>
          </NeumorphicText>
          
          <div className="w-24 h-1 bg-gradient-to-r from-cyber-neon-purple to-cyber-neon-blue mt-4 rounded-full" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Terminal with bio info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Terminal 
              className="w-full shadow-lg" 
              title="whoami@cybersec:~$"
            >
              <CommandLine 
                command="cat about.txt"
                output={`Shreyash Gajbhiye
Cyber Security Analyst

Contact:
- Phone: 9340888163
- Email: byteshreddy@gmail.com

A cybersecurity professional with expertise in network security, penetration testing, and secure application development. Passionate about developing innovative security solutions and staying ahead of emerging threats.`}
              />
            </Terminal>
          </motion.div>
          
          {/* Education */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <NeumorphicBox className="mb-8 p-6">
                <h3 className="font-cyber text-xl text-gradient-cyber mb-4">Education</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CyberIcon icon="book" color="hsl(var(--neon-purple))" />
                      <h4 className="font-cyber ml-2 text-white">Master of Computer Application, Cybersecurity</h4>
                    </div>
                    <p className="text-gray-400 ml-6">Bennett University | Aug 2024 - Present</p>
                    <p className="text-cyber-neon-green ml-6">CGPA: 7.92</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CyberIcon icon="book" color="hsl(var(--neon-blue))" />
                      <h4 className="font-cyber ml-2 text-white">Bachelor of Computer Applications</h4>
                    </div>
                    <p className="text-gray-400 ml-6">RSR RUNGTA COLLEGE OF ENGINEERING & TECHNOLOGY | Jun 2021 - Mar 2024</p>
                    <p className="text-cyber-neon-green ml-6">Score: 73%</p>
                  </div>
                </div>
              </NeumorphicBox>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
