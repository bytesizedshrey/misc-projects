import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Contact from '../components/Contact';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EasterEgg from '../components/EasterEgg';

const Index = () => {
  // Lock scroll on initial load to prevent scroll jitter during transitions
  useEffect(() => {
    document.body.classList.add('overflow-x-hidden');
    document.body.classList.add('bg-cyber-dark');
    
    return () => {
      document.body.classList.remove('overflow-x-hidden');
      document.body.classList.remove('bg-cyber-dark');
    };
  }, []);

  return (
    <div className="bg-cyber-dark text-white">
      <Navbar />
      
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
      
      <Footer />
      <EasterEgg />
    </div>
  );
};

export default Index;
