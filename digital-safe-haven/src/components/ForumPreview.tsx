
import { Button } from "./ui/button";
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
}

// Sample forum posts data
const recentPosts: ForumPost[] = [
  {
    id: '1',
    title: 'Is this email from my bank legitimate?',
    excerpt: 'I received an email claiming to be from my bank asking for account verification...',
    author: 'ConfusedUser',
    authorRole: 'Member',
    date: '2 hours ago',
    replies: 7,
    isVerified: false
  },
  {
    id: '2',
    title: 'Best practices for creating strong passwords',
    excerpt: 'I want to help my elderly parents set up better password practices. What tools and...',
    author: 'SecuritySage',
    authorRole: 'Expert',
    date: '6 hours ago',
    replies: 12,
    isVerified: true
  },
  {
    id: '3',
    title: 'Strange app permissions on my phone',
    excerpt: 'I noticed a flashlight app requesting access to my contacts and location...',
    author: 'PrivacySeeker',
    authorRole: 'Member',
    date: '1 day ago',
    replies: 9,
    isVerified: false
  }
];

export function ForumPreview() {
  return (
    <section className="py-16">
      <div className="cyber-container px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-cyber-light">
            <span className="text-cyber-purple">Recent</span> Discussions
          </h2>
          <Button asChild variant="outline" className="mt-4 md:mt-0 border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-cyber-background">
            <Link to="/forum">View All Posts</Link>
          </Button>
        </div>
        
        <div className="space-y-6">
          {recentPosts.map((post) => (
            <Link
              key={post.id}
              to={`/forum/${post.id}`}
              className="block"
            >
              <div className="cyber-panel hover:border-cyber-purple/80 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-orbitron text-xl font-bold text-cyber-light group-hover:text-cyber-cyan transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center text-sm">
                    <span className="text-cyber-light/60">{post.replies} replies</span>
                  </div>
                </div>
                
                <p className="text-cyber-light/80 mb-4 line-clamp-2">
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
                  
                  <div className="text-sm font-orbitron text-cyber-purple">Read more →</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Button asChild className="cyber-button">
            <Link to="/forum/new">Ask a Question</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
