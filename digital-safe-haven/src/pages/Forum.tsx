
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ForumPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  date: string;
  replies: number;
  isVerified: boolean;
  category: string;
}

// Sample forum posts data (expanded from the preview)
const forumPosts: ForumPost[] = [
  {
    id: '1',
    title: 'Is this email from my bank legitimate?',
    excerpt: "I received an email claiming to be from my bank asking for account verification. The email looks real but I'm not sure if I should click the link. How can I verify if it's genuine?",
    author: 'ConfusedUser',
    authorRole: 'Member',
    date: '2 hours ago',
    replies: 7,
    isVerified: false,
    category: 'Phishing'
  },
  {
    id: '2',
    title: 'Best practices for creating strong passwords',
    excerpt: "I want to help my elderly parents set up better password practices. What tools and techniques do you recommend for someone who isn't very tech savvy?",
    author: 'SecuritySage',
    authorRole: 'Expert',
    date: '6 hours ago',
    replies: 12,
    isVerified: true,
    category: 'Password Security'
  },
  {
    id: '3',
    title: 'Strange app permissions on my phone',
    excerpt: 'I noticed a flashlight app requesting access to my contacts and location. Is this normal or should I be concerned? What should I do about it?',
    author: 'PrivacySeeker',
    authorRole: 'Member',
    date: '1 day ago',
    replies: 9,
    isVerified: false,
    category: 'Mobile Security'
  },
  {
    id: '4',
    title: 'Public Wi-Fi safety tips needed',
    excerpt: 'I often work from coffee shops and use their public Wi-Fi. What precautions should I take to keep my information safe while using these networks?',
    author: 'RemoteWorker',
    authorRole: 'Member',
    date: '2 days ago',
    replies: 15,
    isVerified: false,
    category: 'Network Security'
  },
  {
    id: '5',
    title: 'Analyzing a suspicious attachment',
    excerpt: "I received an email with a .zip attachment that I wasn't expecting. How can I safely determine if it contains malware without opening it?",
    author: 'CautiousClicker',
    authorRole: 'Member',
    date: '3 days ago',
    replies: 11,
    isVerified: false,
    category: 'Malware'
  },
  {
    id: '6',
    title: 'Explaining encryption to non-technical family members',
    excerpt: 'My family keeps sharing sensitive information through unencrypted channels. How can I explain the importance of encryption in simple terms?',
    author: 'CyberEducator',
    authorRole: 'Expert',
    date: '4 days ago',
    replies: 21,
    isVerified: true,
    category: 'Education'
  }
];

// Categories for filtering
const categories = [
  'All Categories',
  'Phishing',
  'Password Security',
  'Mobile Security',
  'Network Security',
  'Malware',
  'Education'
];

const Forum = () => {
  return (
    <div className="min-h-screen flex flex-col bg-cyber-background">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="cyber-container px-4">
          <header className="mb-12">
            <div className="text-center mb-8">
              <h1 className="font-orbitron text-4xl md:text-5xl font-bold text-cyber-light mb-4">
                <span className="text-cyber-purple">Community</span> Forum
              </h1>
              <p className="text-cyber-light/80 max-w-2xl mx-auto">
                Ask questions, share experiences, and learn from cybersecurity experts.
                Our community is here to help you navigate the digital world safely.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="w-full md:w-auto mb-4 md:mb-0">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search forum..."
                    className="cyber-input w-full md:w-64 pl-10 rounded-md"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-cyber-purple absolute left-3 top-1/2 transform -translate-y-1/2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <select className="cyber-input rounded-md bg-cyber-dark text-cyber-light border-cyber-purple">
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <Button asChild className="cyber-button">
                  <Link to="/forum/new">New Post</Link>
                </Button>
              </div>
            </div>
          </header>
          
          <div className="space-y-6">
            {forumPosts.map((post) => (
              <Link
                key={post.id}
                to={`/forum/${post.id}`}
                className="block"
              >
                <div className="cyber-panel hover:border-cyber-purple/80 transition-all duration-300">
                  <div className="flex flex-col md:flex-row justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-xs font-medium text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 px-2 py-0.5 rounded-full">
                          {post.category}
                        </span>
                      </div>
                      
                      <h3 className="font-orbitron text-xl font-bold text-cyber-light hover:text-cyber-purple transition-colors">
                        {post.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center text-sm mt-2 md:mt-0">
                      <span className="text-cyber-light/60 bg-cyber-dark/50 px-2 py-1 rounded">
                        {post.replies} replies
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-cyber-light/80 mb-4">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-cyber-purple/30 border border-cyber-purple/50 mr-3"></div>
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-cyber-light">{post.author}</span>
                          {post.isVerified && (
                            <span className="ml-2 bg-cyber-cyan/20 text-cyber-cyan text-xs px-2 py-0.5 rounded-full border border-cyber-cyan/50">
                              Expert
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-cyber-light/60">{post.date}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm font-orbitron text-cyber-purple">View Discussion →</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button className="cyber-input px-3 py-1 rounded">Prev</button>
              <button className="cyber-input px-3 py-1 rounded bg-cyber-purple/20 border-cyber-purple">1</button>
              <button className="cyber-input px-3 py-1 rounded">2</button>
              <button className="cyber-input px-3 py-1 rounded">3</button>
              <span className="text-cyber-light">...</span>
              <button className="cyber-input px-3 py-1 rounded">10</button>
              <button className="cyber-input px-3 py-1 rounded">Next</button>
            </nav>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Forum;
