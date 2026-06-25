
import React from 'react';
import { Terminal, Shield, Github, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-cyber-darker py-12 overflow-hidden">
      <div className="absolute inset-0 bg-neo-circuit opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          {/* Logo */}
          <div className="mb-6 md:mb-0">
            <a href="#" className="flex items-center space-x-2 text-white font-cyber text-lg">
              <div className="w-8 h-8 bg-cyber-darkest border border-cyber-neon-blue rounded-md flex items-center justify-center shadow-neon-blue">
                <Terminal size={18} className="text-cyber-neon-blue" />
              </div>
              <span className="text-gradient-cyber font-bold">Cyber<span className="text-white">Sec</span></span>
            </a>
            <p className="text-gray-400 text-sm mt-2 max-w-xs">
              Securing digital realms through expertise, vigilance, and innovative approaches.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-cyber text-white mb-4">Navigation</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-cyber-neon-blue transition-colors text-sm">Home</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-cyber-neon-blue transition-colors text-sm">About</a></li>
                <li><a href="#skills" className="text-gray-400 hover:text-cyber-neon-blue transition-colors text-sm">Skills</a></li>
                <li><a href="#projects" className="text-gray-400 hover:text-cyber-neon-blue transition-colors text-sm">Projects</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-cyber-neon-blue transition-colors text-sm">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-cyber text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-cyber-neon-blue transition-colors text-sm">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyber-neon-blue transition-colors text-sm">Case Studies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyber-neon-blue transition-colors text-sm">Tools</a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyber-neon-blue transition-colors text-sm">Certifications</a></li>
              </ul>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-cyber text-white mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-cyber-neon-blue hover:border-cyber-neon-blue transition-all">
                  <Github size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-cyber-neon-blue hover:border-cyber-neon-blue transition-all">
                  <Linkedin size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-cyber-neon-blue hover:border-cyber-neon-blue transition-all">
                  <Twitter size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 mt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} CyberSec Portfolio. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-500 hover:text-cyber-neon-blue text-xs transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-cyber-neon-blue text-xs transition-colors">
              Terms of Service
            </a>
            <div className="flex items-center text-cyber-neon-green text-xs">
              <Shield size={12} className="mr-1" />
              <span>Secured Connection</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
