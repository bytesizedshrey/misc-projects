
import * as React from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-cyber-purple bg-cyber-background/80 backdrop-blur-md shadow-[0_0_15px_rgba(128,0,255,0.3)]">
      <div className="cyber-container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-cyber-purple animate-pulse"></div>
            <span className="font-orbitron text-xl font-bold tracking-wider text-cyber-light">
              <span className="text-cyber-purple">Cyber</span>
              <span className="text-cyber-cyan">Safe</span>
            </span>
          </Link>
        </div>
        {/* Desktop Navigation */}
        <div className={`${isMobile ? "hidden" : "flex"} items-center gap-6`}>
          <Link to="/forum" className="font-orbitron text-cyber-light hover:text-cyber-cyan transition-colors">
            Forum
          </Link>
          <Link to="/tools" className="font-orbitron text-cyber-light hover:text-cyber-cyan transition-colors">
            Tools
          </Link>
          <Link to="/about" className="font-orbitron text-cyber-light hover:text-cyber-cyan transition-colors">
            About
          </Link>
          <Link to="/auth-magic">
            <Button className="cyber-button ml-4">Sign In</Button>
          </Link>
        </div>
        {/* Mobile menu button */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-cyber-light hover:text-cyber-cyan"
          >
            <span className="sr-only">Open menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        )}
        {/* Mobile menu */}
        {isMobile && menuOpen && (
          <div className="absolute top-16 right-0 left-0 bg-cyber-background border-b border-cyber-purple py-4 px-4 shadow-lg">
            <div className="flex flex-col gap-4">
              <Link
                to="/forum"
                onClick={() => setMenuOpen(false)}
                className="font-orbitron text-cyber-light hover:text-cyber-cyan px-4 py-2 transition-colors"
              >
                Forum
              </Link>
              <Link
                to="/tools"
                onClick={() => setMenuOpen(false)}
                className="font-orbitron text-cyber-light hover:text-cyber-cyan px-4 py-2 transition-colors"
              >
                Tools
              </Link>
              <Link
                to="/about"
                onClick={() => setMenuOpen(false)}
                className="font-orbitron text-cyber-light hover:text-cyber-cyan px-4 py-2 transition-colors"
              >
                About
              </Link>
              <Link to="/auth-magic" onClick={() => setMenuOpen(false)}>
                <Button className="cyber-button w-full mt-2">Sign In</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
