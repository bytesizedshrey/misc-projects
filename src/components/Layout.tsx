
import { Link } from "react-router-dom";
import { Shield, Settings, BookOpen, User } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-clay-bg">
      <header className="py-4 px-6 border-b border-white/20 shadow-sm flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-clay-purple" />
          <span className="text-2xl font-bold bg-gradient-to-r from-clay-purple to-clay-purple-dark bg-clip-text text-transparent">
            CryptoNet Guardian
          </span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link to="/" className="text-clay-neutral-400 hover:text-clay-purple transition-colors">
            Home
          </Link>
          <Link to="/simulator" className="text-clay-neutral-400 hover:text-clay-purple transition-colors">
            Network Simulator
          </Link>
          <Link to="/lessons" className="text-clay-neutral-400 hover:text-clay-purple transition-colors">
            Lessons
          </Link>
          <Link to="/about" className="text-clay-neutral-400 hover:text-clay-purple transition-colors">
            About
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <button 
            className="rounded-full p-2 hover:bg-clay-purple/10 transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5 text-clay-neutral-400" />
          </button>
          <button 
            className="rounded-full p-2 hover:bg-clay-purple/10 transition-colors"
            aria-label="Lessons"
          >
            <BookOpen className="h-5 w-5 text-clay-neutral-400" />
          </button>
          <button 
            className="rounded-full p-2 hover:bg-clay-purple/10 transition-colors"
            aria-label="User"
          >
            <User className="h-5 w-5 text-clay-neutral-400" />
          </button>
        </div>
      </header>
      <main className="flex-1 container mx-auto py-6 px-4">
        {children}
      </main>
      <footer className="py-4 px-6 border-t border-white/20 text-center text-clay-neutral-300 text-sm">
        &copy; {new Date().getFullYear()} CryptoNet Guardian - Educational Network Security Tool
      </footer>
    </div>
  );
};

export default Layout;
