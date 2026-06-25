
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NeumorphicText, NeumorphicBox } from './ui/neumorphic';
import { Terminal, TypingEffect } from './ui/terminal';
import { CyberIcon, GlitchText } from './ui/cyber-elements';

export default function Contact() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
  });
  
  const [stage, setStage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };
  
  const moveToNextStage = () => {
    if (stage < 2) {
      setStage(stage + 1);
    }
  };
  
  // Different stages of the terminal form
  const renderStage = () => {
    switch (stage) {
      case 0:
        return (
          <>
            <div className="mb-4 text-white">
              <TypingEffect 
                text="Please enter your name to initialize secure connection:" 
                speed={30}
                onComplete={() => {}}
              />
            </div>
            <input
              type="text"
              name="name"
              value={formState.name}
              onChange={handleChange}
              className="w-full bg-cyber-darkest border border-cyber-neon-purple text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-cyber-neon-purple font-mono"
              autoFocus
            />
            {formState.name && (
              <button 
                className="mt-4 bg-cyber-darker px-4 py-2 text-white border border-cyber-neon-blue rounded hover:bg-cyber-neon-blue hover:bg-opacity-20 transition-colors font-mono"
                onClick={moveToNextStage}
              >
                Continue <span className="ml-2 animate-terminal-blink">▋</span>
              </button>
            )}
          </>
        );
      case 1:
        return (
          <>
            <div className="mb-4 text-white">
              <TypingEffect 
                text={`User identified as: ${formState.name}\nPlease enter your email to verify identity:`}
                speed={30}
                onComplete={() => {}}
              />
            </div>
            <input
              type="email"
              name="email"
              value={formState.email}
              onChange={handleChange}
              className="w-full bg-cyber-darkest border border-cyber-neon-purple text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-cyber-neon-purple font-mono"
              autoFocus
            />
            {formState.email && (
              <button 
                className="mt-4 bg-cyber-darker px-4 py-2 text-white border border-cyber-neon-blue rounded hover:bg-cyber-neon-blue hover:bg-opacity-20 transition-colors font-mono"
                onClick={moveToNextStage}
              >
                Authenticate <span className="ml-2 animate-terminal-blink">▋</span>
              </button>
            )}
          </>
        );
      case 2:
        return (
          <>
            <div className="mb-4 text-white">
              <TypingEffect 
                text={`Authentication successful.\nConnection encrypted with end-to-end TLS 1.3\nYou may now send your message securely:`}
                speed={30}
                onComplete={() => {}}
              />
            </div>
            <textarea
              name="message"
              value={formState.message}
              onChange={handleChange}
              rows={5}
              className="w-full bg-cyber-darkest border border-cyber-neon-green text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-cyber-neon-green font-mono"
              autoFocus
            />
            
            {formState.message && !isSubmitting && !isSubmitted && (
              <button 
                className="mt-4 bg-cyber-darker px-4 py-2 text-white border border-cyber-neon-green rounded hover:bg-cyber-neon-green hover:bg-opacity-20 transition-colors font-mono"
                onClick={handleSubmit}
              >
                Send Secure Message <span className="ml-2 animate-terminal-blink">▋</span>
              </button>
            )}
            
            {isSubmitting && (
              <div className="mt-4 text-cyber-neon-blue font-mono">
                <span className="inline-block animate-pulse mr-2">⧗</span> 
                Encrypting and sending message...
              </div>
            )}
            
            {isSubmitted && (
              <div className="mt-4 text-cyber-neon-green font-mono">
                <span className="mr-2">✓</span> 
                Message sent successfully! I'll respond shortly.
              </div>
            )}
          </>
        );
    }
  };
  
  return (
    <section id="contact" className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-cyber-grid opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center mb-16">
          <NeumorphicText variant="h2" className="text-center" glowing>
            <span className="text-cyber-neon-blue">ssh</span>
            <span className="text-white">@</span>
            <span className="text-cyber-neon-green">contact</span>
          </NeumorphicText>
          
          <div className="w-24 h-1 bg-gradient-to-r from-cyber-neon-purple to-cyber-neon-green mt-4 rounded-full" />
          
          <p className="text-gray-300 mt-4 max-w-2xl text-center">
            Have a security challenge or want to connect? Send a secure message through this encrypted terminal.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <NeumorphicBox>
                <h3 className="font-cyber text-xl text-gradient-cyber mb-6">Connection Details</h3>
                
                <div className="space-y-6">
                  <ContactItem 
                    icon="mail"
                    title="Email"
                    value="bytesizedshrey@gmail.com"
                    color="hsl(var(--neon-purple))"
                  />
                  
                  <ContactItem 
                    icon="terminal"
                    title="Discord"
                    value="bytesizedshrey"
                    color="hsl(var(--neon-blue))"
                  />
                  
                  <ContactItem 
                    icon="code"
                    title="GitHub"
                    value="github.com/bytesizedshrey"
                    color="hsl(var(--terminal-green))"
                  />
                  
                  <ContactItem 
                    icon="shield"
                    title="Location"
                    value="Greater Noida"
                    color="hsl(var(--neon-purple))"
                  />
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-800">
                  <h4 className="font-cyber text-white text-lg mb-4">Encryption Key</h4>
                  <div className="bg-cyber-darkest p-3 rounded font-mono text-xs text-cyber-neon-green overflow-x-auto">
                    <GlitchText 
                      text="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC7CyhSF+sEGr... [TRUNCATED]" 
                      glitchInterval={5000}
                      className="whitespace-nowrap"
                    />
                  </div>
                </div>
              </NeumorphicBox>
            </motion.div>
          </div>
          
          {/* Contact Form Terminal */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Terminal 
                className="w-full h-[450px] shadow-neon-purple"
                title="contact@cybersec:~$"
                showPrompt={false}
              >
                <div className="p-4">
                  <form onSubmit={handleSubmit}>
                    {renderStage()}
                  </form>
                </div>
              </Terminal>
              
              <p className="text-gray-500 text-sm text-center mt-4 font-mono">
                <span className="text-cyber-neon-green">Note:</span> All messages are encrypted end-to-end and stored securely.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ContactItemProps {
  icon: 'shield' | 'lock' | 'terminal' | 'server' | 'database' | 'code' | 'key' | 'mail';
  title: string;
  value: string;
  color: string;
}

function ContactItem({ icon, title, value, color }: ContactItemProps) {
  return (
    <div className="flex items-start">
      <div className="mr-4">
        <CyberIcon icon={icon} size={24} glowing color={color} />
      </div>
      
      <div>
        <h4 className="text-gray-400 text-sm">{title}</h4>
        <p className="text-white font-mono">{value}</p>
      </div>
    </div>
  );
}
