
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Menu, X } from 'lucide-react';
import { NeumorphicText } from './ui/neumorphic';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ];
  
  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-cyber-darker bg-opacity-80 backdrop-blur-lg shadow-md py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <a 
              href="#" 
              className="flex items-center space-x-2 text-white font-cyber text-lg"
            >
              <div className="w-8 h-8 bg-cyber-darker border border-cyber-neon-blue rounded-md flex items-center justify-center shadow-neon-blue">
                <Terminal size={18} className="text-cyber-neon-blue" />
              </div>
              <span className="text-gradient-cyber font-bold">Cyber<span className="text-white">Sec</span></span>
            </a>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  className="text-gray-300 hover:text-cyber-neon-blue transition-colors font-cyber text-sm relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyber-neon-blue transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
              
              <a 
                href="#contact" 
                className="bg-cyber-darker px-4 py-2 rounded text-white border border-cyber-neon-purple hover:bg-cyber-neon-purple hover:bg-opacity-20 transition-colors font-cyber text-sm flex items-center"
              >
                <Shield size={14} className="mr-2" />
                Connect
              </a>
            </nav>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white focus:outline-none"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 bg-cyber-darker bg-opacity-95 backdrop-blur-lg shadow-lg z-40 border-t border-gray-800"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <a 
                    key={link.name}
                    href={link.href}
                    className="text-gray-300 hover:text-cyber-neon-blue transition-colors font-cyber py-2 border-b border-gray-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
