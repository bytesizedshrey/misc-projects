
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-cyber-background">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="cyber-container px-4">
          <header className="mb-12 text-center">
            <h1 className="font-orbitron text-4xl md:text-5xl font-bold text-cyber-light mb-4">
              About <span className="text-cyber-purple">CyberSafe</span> <span className="text-cyber-cyan">Knowledge Hub</span>
            </h1>
            <p className="text-cyber-light/80 max-w-2xl mx-auto">
              Our mission is to make cybersecurity accessible and understandable for everyone, 
              regardless of technical background.
            </p>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="cyber-panel p-6 h-full">
              <h2 className="font-orbitron text-2xl font-bold text-cyber-cyan mb-4">
                Our Mission
              </h2>
              <p className="text-cyber-light/80 mb-4">
                In today's digital world, cybersecurity threats affect everyone, yet many people lack the knowledge 
                to protect themselves online. The CyberSafe Knowledge Hub bridges this gap by creating a space where:
              </p>
              <ul className="space-y-2 text-cyber-light/80 mb-4 list-disc list-inside">
                <li>Non-technical users can ask questions without judgment</li>
                <li>Experts can share knowledge in accessible language</li>
                <li>Free, trustworthy tools are easily discoverable</li>
                <li>Community wisdom is valued and preserved</li>
              </ul>
              <p className="text-cyber-light/80">
                We believe that cybersecurity education shouldn't be intimidating or filled with jargon. 
                Our community emphasizes clarity, patience, and practical advice that anyone can follow.
              </p>
            </div>
            
            <div className="cyber-panel p-6 h-full">
              <h2 className="font-orbitron text-2xl font-bold text-cyber-purple mb-4">
                Who We Are
              </h2>
              <p className="text-cyber-light/80 mb-4">
                CyberSafe Knowledge Hub was created by a diverse group of cybersecurity professionals, educators, 
                and digital rights advocates who saw a need for more inclusive security education.
              </p>
              <p className="text-cyber-light/80 mb-4">
                Our volunteer experts include:
              </p>
              <ul className="space-y-2 text-cyber-light/80 mb-4 list-disc list-inside">
                <li>Cybersecurity researchers and practitioners</li>
                <li>Digital privacy advocates</li>
                <li>Educators specializing in technology literacy</li>
                <li>Developers of open-source security tools</li>
                <li>Community moderators ensuring a supportive environment</li>
              </ul>
              <p className="text-cyber-light/80">
                We're united by our commitment to democratizing cybersecurity knowledge and helping underserved 
                communities develop digital resilience.
              </p>
            </div>
          </div>
          
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="font-orbitron text-3xl font-bold text-cyber-light mb-2">
                Core <span className="text-cyber-cyan">Values</span>
              </h2>
              <p className="text-cyber-light/80 max-w-2xl mx-auto">
                These principles guide everything we do at the CyberSafe Knowledge Hub.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="cyber-panel p-6">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="font-orbitron text-xl font-bold text-cyber-purple mb-2">
                  Accessibility
                </h3>
                <p className="text-cyber-light/80">
                  We explain cybersecurity concepts in clear, jargon-free language. Our content is 
                  designed to be understood by people of all technical levels and backgrounds.
                </p>
              </div>
              
              <div className="cyber-panel p-6">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="font-orbitron text-xl font-bold text-cyber-purple mb-2">
                  Trustworthiness
                </h3>
                <p className="text-cyber-light/80">
                  We verify the security tools we recommend and ensure all advice is accurate, 
                  current, and follows best practices. We prioritize user privacy and data protection.
                </p>
              </div>
              
              <div className="cyber-panel p-6">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="font-orbitron text-xl font-bold text-cyber-purple mb-2">
                  Community
                </h3>
                <p className="text-cyber-light/80">
                  We foster a supportive environment where questions are welcomed, 
                  diverse perspectives are valued, and collective knowledge is shared.
                </p>
              </div>
              
              <div className="cyber-panel p-6">
                <div className="text-4xl mb-4">🔓</div>
                <h3 className="font-orbitron text-xl font-bold text-cyber-purple mb-2">
                  Openness
                </h3>
                <p className="text-cyber-light/80">
                  We champion open-source solutions and transparent security practices. 
                  Our platform itself is open for community contributions and improvement.
                </p>
              </div>
              
              <div className="cyber-panel p-6">
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="font-orbitron text-xl font-bold text-cyber-purple mb-2">
                  Inclusivity
                </h3>
                <p className="text-cyber-light/80">
                  We design for diverse users with different abilities, languages, and access needs. 
                  We actively work to reach underserved communities.
                </p>
              </div>
              
              <div className="cyber-panel p-6">
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="font-orbitron text-xl font-bold text-cyber-purple mb-2">
                  Adaptability
                </h3>
                <p className="text-cyber-light/80">
                  We continuously evolve our resources to address new threats and technologies, 
                  ensuring our community has relevant, up-to-date information.
                </p>
              </div>
            </div>
          </div>
          
          <div className="cyber-panel p-8 mb-16">
            <div className="text-center mb-8">
              <h2 className="font-orbitron text-3xl font-bold text-cyber-light mb-2">
                How You Can <span className="text-cyber-purple">Contribute</span>
              </h2>
              <p className="text-cyber-light/80 max-w-2xl mx-auto">
                The CyberSafe Knowledge Hub is a community effort. Here's how you can get involved:
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-orbitron text-xl font-bold text-cyber-cyan mb-4">
                  For Everyone
                </h3>
                <ul className="space-y-3 text-cyber-light/80">
                  <li className="flex items-start">
                    <span className="text-cyber-cyan mr-2">✓</span>
                    <span>Ask questions and share your cybersecurity experiences in the forum</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyber-cyan mr-2">✓</span>
                    <span>Help test and review open-source security tools</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyber-cyan mr-2">✓</span>
                    <span>Suggest improvements to make our content more accessible</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyber-cyan mr-2">✓</span>
                    <span>Share the platform with friends and family who could benefit</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyber-cyan mr-2">✓</span>
                    <span>Report security issues or suspicious content</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-orbitron text-xl font-bold text-cyber-cyan mb-4">
                  For Experts
                </h3>
                <ul className="space-y-3 text-cyber-light/80">
                  <li className="flex items-start">
                    <span className="text-cyber-purple mr-2">✓</span>
                    <span>Volunteer as a forum moderator or expert advisor</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyber-purple mr-2">✓</span>
                    <span>Contribute code to our open-source platform</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyber-purple mr-2">✓</span>
                    <span>Submit security tools for inclusion in our database</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyber-purple mr-2">✓</span>
                    <span>Create educational content that explains complex topics simply</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyber-purple mr-2">✓</span>
                    <span>Help translate resources to reach more communities</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Button asChild className="cyber-button px-8 py-6 text-lg">
                <Link to="/contribute">Join Our Community</Link>
              </Button>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="font-orbitron text-3xl font-bold text-cyber-light mb-6">
              Contact <span className="text-cyber-cyan">Us</span>
            </h2>
            
            <div className="cyber-panel p-6 max-w-xl mx-auto">
              <p className="text-cyber-light/80 mb-6">
                Have questions, suggestions, or want to report an issue?
                We welcome your feedback and inquiries.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Button asChild className="cyber-button">
                  <Link to="/contact">Contact Form</Link>
                </Button>
                <Button asChild variant="outline" className="border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/20">
                  <a href="mailto:info@cybersafehub.example.org">Email Us</a>
                </Button>
              </div>
              
              <div className="text-sm text-cyber-light/60">
                For security vulnerabilities, please use our responsible disclosure process:
                <a href="/security" className="text-cyber-purple hover:text-cyber-cyan ml-1">
                  Security Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
