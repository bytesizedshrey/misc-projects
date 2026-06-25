import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NeumorphicText, NeumorphicBox } from './ui/neumorphic';
import { CyberIcon, IsometricIcon, GlitchText } from './ui/cyber-elements';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  icon: 'shield' | 'lock' | 'terminal' | 'server' | 'database' | 'code' | 'key';
  color: string;
}

// Sample projects data
const projectsData: Project[] = [
  {
    id: 'legal-maxims',
    title: 'Gamified Legal Maxims Learning Platform',
    description: 'An AI-powered platform that transforms legal education through gamification, offering personalized quizzes, adaptive feedback, and engaging challenges for law students.',
    tags: ['AI', 'Gamification', 'Education'],
    icon: 'code',
    color: 'hsl(var(--neon-purple))',
  },
  {
    id: 'owasp-scanner',
    title: 'Mobile App Security Scanner',
    description: 'A security scanning application that analyzes mobile apps for OWASP Mobile Top 10 vulnerabilities, providing detailed reports and remediation recommendations.',
    tags: ['Security', 'Mobile', 'OWASP'],
    icon: 'shield',
    color: 'hsl(var(--neon-blue))',
  },
  {
    id: 'steganography',
    title: 'Steganography Application',
    description: 'A secure data concealment tool that enables hiding and extracting encrypted messages within digital media files, ensuring confidential communication.',
    tags: ['Cryptography', 'Security', 'Privacy'],
    icon: 'lock',
    color: 'hsl(var(--terminal-green))',
  }
];

export default function Projects() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  
  return (
    <section id="projects" className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-neo-circuit opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center mb-16">
          <NeumorphicText variant="h2" className="text-center" glowing>
            <span className="text-cyber-neon-purple">{'{'}</span>
            _projects
            <span className="text-cyber-neon-purple">{'}'}</span>
          </NeumorphicText>
          
          <div className="w-24 h-1 bg-gradient-to-r from-cyber-neon-blue to-cyber-neon-green mt-4 rounded-full" />
          
          <p className="text-gray-300 mt-4 max-w-2xl text-center">
            Showcasing my security projects with a focus on vulnerability assessment and secure system design.
          </p>
        </div>
        
        {/* Isometric server rack visualization */}
        <div className="mb-16 flex justify-center">
          <motion.div 
            className="relative w-full max-w-4xl h-[300px] perspective-1000"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-4 transform-gpu" style={{ transform: 'rotateX(60deg) rotateZ(-45deg)' }}>
                {projectsData.map((project, index) => (
                  <ProjectServerUnit 
                    key={project.id}
                    project={project}
                    index={index}
                    isActive={activeProject?.id === project.id}
                    onClick={() => setActiveProject(project)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Project details */}
        <AnimatedProjectDetail project={activeProject} />
        
        {/* Project cards as fallback/alternative view */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {projectsData.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project}
              isActive={activeProject?.id === project.id}
              onClick={() => setActiveProject(project)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ProjectServerUnitProps {
  project: Project;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

function ProjectServerUnit({ project, index, isActive, onClick }: ProjectServerUnitProps) {
  return (
    <motion.div
      className="relative cursor-pointer"
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
    >
      {/* Server rack unit */}
      <div 
        className={`relative w-full h-24 border border-gray-700 ${isActive ? 'border-opacity-100' : 'border-opacity-50'} rounded-sm overflow-hidden`}
        style={{
          background: `rgba(26, 31, 44, 0.8)`,
          boxShadow: isActive 
            ? `0 0 15px ${project.color}, 0 0 5px ${project.color}` 
            : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Server front panel */}
        <div className="absolute inset-0 p-2 flex flex-col">
          <div className="flex items-center mb-1">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <div className="text-xs ml-1 text-gray-400 truncate font-mono">
              {project.id}
            </div>
          </div>
          
          <div className="flex justify-center items-center h-full">
            <CyberIcon 
              icon={project.icon} 
              size={20} 
              glowing={isActive} 
              color={project.color}
            />
          </div>
        </div>
        
        {/* Connection lines */}
        <div className="absolute right-0 top-1/2 w-8 h-1 -mr-8 border-t border-dashed border-gray-600 opacity-50" />
        
        {/* Activity lights */}
        <div className="absolute right-2 top-2 flex space-x-1">
          <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-blue-400 animate-pulse-slow' : 'bg-gray-600'}`} />
          <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-green-400 animate-pulse-slow' : 'bg-gray-600'}`} />
        </div>
      </div>
    </motion.div>
  );
}

interface ProjectCardProps {
  project: Project;
  isActive: boolean;
  onClick: () => void;
}

function ProjectCard({ project, isActive, onClick }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <NeumorphicBox 
        className={`h-full border ${isActive ? 'border-[' + project.color + ']' : 'border-transparent'} transition-colors`}
        hoverEffect
        onClick={onClick}
      >
        <div className="p-1">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <IsometricIcon 
                icon={project.icon} 
                size={36} 
                color={project.color}
              />
              <h3 className="ml-3 font-cyber text-lg text-white">
                <GlitchText text={project.title} glitchInterval={10000} />
              </h3>
            </div>
          </div>
          
          <p className="text-gray-300 text-sm mb-4">
            {project.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, index) => (
              <span 
                key={index}
                className="text-xs font-mono px-2 py-1 rounded-sm bg-cyber-darker border border-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </NeumorphicBox>
    </motion.div>
  );
}

interface AnimatedProjectDetailProps {
  project: Project | null;
}

function AnimatedProjectDetail({ project }: AnimatedProjectDetailProps) {
  if (!project) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="mb-16"
    >
      <NeumorphicBox className="p-6 border-t-2" style={{ borderColor: project.color }}>
        <div className="flex items-center mb-4">
          <IsometricIcon 
            icon={project.icon} 
            size={48} 
            color={project.color}
          />
          <div className="ml-4">
            <h3 className="font-cyber text-xl text-gradient-cyber">
              {project.title}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {project.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs font-mono px-2 py-1 rounded-sm bg-cyber-darker border border-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-gray-300 mb-6 text-lg leading-relaxed">
          {project.description}
        </p>
        
        <div className="flex gap-4">
          <button className="bg-cyber-darker px-4 py-2 rounded-sm border border-gray-700 hover:border-cyber-neon-blue transition-colors text-white font-cyber text-sm">
            View Details
          </button>
          <button className="bg-transparent px-4 py-2 rounded-sm border border-gray-700 hover:border-cyber-neon-green transition-colors text-white font-cyber text-sm">
            Source Code
          </button>
        </div>
      </NeumorphicBox>
    </motion.div>
  );
}
