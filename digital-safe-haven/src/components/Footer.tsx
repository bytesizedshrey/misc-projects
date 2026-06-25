
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-cyber-purple bg-cyber-background py-8">
      <div className="cyber-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-cyber-purple"></div>
              <span className="font-orbitron text-xl font-bold tracking-wider text-cyber-light">
                <span className="text-cyber-purple">Cyber</span>
                <span className="text-cyber-cyan">Safe</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-cyber-light/70">
              A community platform for cybersecurity knowledge sharing and peer-to-peer learning.
            </p>
          </div>

          <div className="md:col-span-1">
            <h3 className="font-orbitron text-lg font-semibold text-cyber-cyan mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-cyber-light/80 hover:text-cyber-cyan transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/forum" className="text-cyber-light/80 hover:text-cyber-cyan transition-colors">
                  Forum
                </Link>
              </li>
              <li>
                <Link to="/tools" className="text-cyber-light/80 hover:text-cyber-cyan transition-colors">
                  Tools Database
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-cyber-light/80 hover:text-cyber-cyan transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h3 className="font-orbitron text-lg font-semibold text-cyber-cyan mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/guidelines" className="text-cyber-light/80 hover:text-cyber-cyan transition-colors">
                  Guidelines
                </Link>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-cyber-light/80 hover:text-cyber-cyan transition-colors">
                  GitHub Repository
                </a>
              </li>
              <li>
                <Link to="/contribute" className="text-cyber-light/80 hover:text-cyber-cyan transition-colors">
                  Contribute
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h3 className="font-orbitron text-lg font-semibold text-cyber-cyan mb-4">Language</h3>
            <div className="flex items-center space-x-2">
              <button className="text-cyber-light bg-cyber-dark hover:bg-cyber-purple/20 border border-cyber-purple px-3 py-1 rounded transition-colors">
                English
              </button>
              <button className="text-cyber-light/70 hover:text-cyber-light border border-transparent hover:border-cyber-cyan px-3 py-1 rounded transition-all">
                Español
              </button>
            </div>
            <div className="mt-4">
              <h3 className="font-orbitron text-lg font-semibold text-cyber-cyan mb-4">Accessibility</h3>
              <button className="text-cyber-light bg-cyber-dark hover:bg-cyber-purple/20 border border-cyber-purple px-3 py-1 rounded transition-colors">
                High Contrast Mode
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-cyber-purple/50 pt-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-cyber-light/50 mb-2 md:mb-0">
            &copy; {new Date().getFullYear()} CyberSafe Knowledge Hub. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link to="/privacy" className="text-sm text-cyber-light/70 hover:text-cyber-cyan">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-cyber-light/70 hover:text-cyber-cyan">
              Terms of Service
            </Link>
            <Link to="/contact" className="text-sm text-cyber-light/70 hover:text-cyber-cyan">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
