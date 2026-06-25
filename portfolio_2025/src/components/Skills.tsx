import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, CommandLine } from './ui/terminal';
import { NeumorphicText, NeumorphicBox } from './ui/neumorphic';
import { CyberIcon } from './ui/cyber-elements';

interface Skill {
  name: string;
  // level: number;
  category: 'offensive' | 'defensive' | 'development' | 'analysis';
  description: string;
  icon: 'shield' | 'lock' | 'terminal' | 'server' | 'database' | 'code' | 'key';
}

const skills: Skill[] = [
  {
    name: 'Network Security',
    // level: 90,
    category: 'defensive',
    description: 'Securing network infrastructure and protecting against cyber threats',
    icon: 'shield'
  },
  {
    name: 'Python',
    // level: 85,
    category: 'development',
    description: 'Building security tools and automation scripts',
    icon: 'code'
  },
  {
    name: 'JavaScript',
    // level: 80,
    category: 'development',
    description: 'Web application security and development',
    icon: 'code'
  },
  {
    name: 'Cryptography',
    // level: 85,
    category: 'defensive',
    description: 'Implementing secure encryption and data protection',
    icon: 'key'
  },
  {
    name: 'ReactJS',
    // level: 80,
    category: 'development',
    description: 'Building secure and responsive web applications',
    icon: 'code'
  },
  {
    name: 'Swift',
    // level: 75,
    category: 'development',
    description: 'iOS application security and development',
    icon: 'code'
  }
];

export default function Skills() {
  const [filter, setFilter] = useState<string>('all');
  
  const filteredSkills = filter === 'all' 
    ? skills 
    : skills.filter(skill => skill.category === filter);
    
  return (
    <section id="skills" className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-cyber-grid opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center mb-16">
          <NeumorphicText variant="h2" className="text-center" glowing>
            <span className="text-cyber-neon-green">function</span>
            {' '}showSkills<span className="text-cyber-neon-purple">()</span>
          </NeumorphicText>
          
          <div className="w-24 h-1 bg-gradient-to-r from-cyber-neon-green to-cyber-neon-blue mt-4 rounded-full" />
          
          <p className="text-gray-300 mt-4 max-w-2xl text-center">
            My technical expertise spans offensive and defensive security, complemented by strong programming skills.
          </p>
        </div>
        
        {/* Terminal with skills */}
        <div className="mb-12">
          <Terminal 
            className="w-full max-w-4xl mx-auto"
            title="skills@cybersec:~$"
            showPrompt={true}
          >
            <CommandLine
              command="cat skills.json | jq"
              output={`{
  "name": "Cybersecurity Professional",
  "specialization": "Network Security & Web Security",
  "skills": {
    "languages": ["Python", "C++", "JavaScript", "SQL", "Bash","Swift"],
    "security_tools": ["Wireshark", "Nmap", "Burp Suite", "Kali Linux"],
  },
  "certifications": ["Security+", "Network+", "Ethical Hacker"]
}`}
            />
          </Terminal>
        </div>
        
        {/* Filter tabs */}
        <div className="flex justify-center mb-8 overflow-x-auto">
          <div className="flex space-x-2 py-2">
            {['all', 'offensive', 'defensive', 'development', 'analysis'].map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded font-cyber text-sm transition-colors ${
                  filter === category
                    ? 'bg-cyber-darker border border-cyber-neon-blue shadow-neon-blue text-white'
                    : 'bg-cyber-darker border-transparent text-gray-400 hover:text-white hover:border-gray-700'
                }`}
                onClick={() => setFilter(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Skills grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface SkillCardProps {
  skill: Skill;
}

function SkillCard({ skill }: SkillCardProps) {
  // Colors for different categories
  const categoryColors = {
    offensive: 'hsl(var(--error-red))',
    defensive: 'hsl(var(--neon-purple))',
    development: 'hsl(var(--terminal-green))',
    analysis: 'hsl(var(--neon-blue))'
  };
  
  const color = categoryColors[skill.category];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <NeumorphicBox className="h-full">
        <div className="flex items-start mb-4">
          <div className="mr-4">
            <CyberIcon 
              icon={skill.icon} 
              size={28} 
              glowing 
              color={color} 
            />
          </div>
          
          <div className="flex-1">
            <h3 className="font-cyber text-white text-lg mb-1">{skill.name}</h3>
            <p className="text-gray-400 text-sm mb-4">
              {skill.description}
            </p>
          </div>
        </div>
        
        {/* Skill level indicator */}
        <div className="w-full h-2 bg-cyber-darker rounded-full overflow-hidden neumorphic-inset">
          <motion.div
            initial={{ width: 0 }}
            // whileInView={{ width: `${skill.level}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full rounded-full"
            style={{ 
              background: `linear-gradient(90deg, ${color} 0%, ${color}aa 100%)`,
              boxShadow: `0 0 10px ${color}66`
            }}
          />
        </div>
        
        <div className="mt-2 flex justify-between text-xs">
          <span className="text-gray-500">Beginner</span>
          {/* <span className="text-white font-mono">{skill.level}%</span> */}
          <span className="text-gray-500">Expert</span>
        </div>
      </NeumorphicBox>
    </motion.div>
  );
}
