import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { Shield, Server, Computer, AlertCircle, Lock, Unlock, ArrowRight } from "lucide-react";
import Homepage3dDemo from "../components/Homepage3dDemo";

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-12 md:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto px-4"
        >
          <div className="mb-6 flex flex-col items-center">
            <Homepage3dDemo />
            <motion.div
              className="clay-card p-6 inline-block"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Shield className="h-12 w-12 text-clay-purple" />
            </motion.div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-clay-purple-dark to-clay-purple bg-clip-text text-transparent">
            CryptoNet Guardian
          </h1>
          
          <p className="text-xl text-clay-neutral-400 mb-8 max-w-2xl mx-auto">
            Learn network security and cryptography through interactive simulations.
            Build virtual networks, test encryption protocols, and defend against attacks.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/simulator"
              className="clay-button clay-button-primary flex items-center justify-center gap-2"
            >
              <span>Start Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link
              to="/lessons"
              className="clay-button flex items-center justify-center gap-2"
            >
              <span>View Lessons</span>
            </Link>
          </div>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Server}
              title="Build Networks"
              description="Drag and drop servers, clients, and network components to create your own virtual network topology."
              delay={0.1}
            />
            
            <FeatureCard
              icon={Lock}
              title="Apply Encryption"
              description="Implement TLS and other cryptographic protocols to secure communication between network components."
              delay={0.2}
            />
            
            <FeatureCard
              icon={AlertCircle}
              title="Test Against Attacks"
              description="Simulate Man-in-the-Middle attacks and other security threats to see how your network responds."
              delay={0.3}
            />
          </div>
        </div>
      </section>
      
      {/* Learning Section */}
      <section className="py-12 md:py-20 bg-clay-neutral-100/50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Educational Journey</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Learn by Doing</h3>
              
              <ul className="space-y-4">
                {[
                  "Understand encryption protocols through visual simulations",
                  "See real-time effects of security configurations",
                  "Receive immediate feedback and educational insights",
                  "Progress from basics to advanced network security concepts",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1">
                      <div className="h-4 w-4 rounded-full bg-clay-purple" />
                    </div>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
              
              <div className="mt-8">
                <Link
                  to="/simulator"
                  className="clay-button clay-button-primary inline-flex items-center gap-2"
                >
                  <span>Try It Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            
            <div className="clay-card p-6 lg:p-8">
              <div className="relative h-60 md:h-72 bg-gradient-to-br from-clay-purple/10 to-clay-blue/10 rounded-xl overflow-hidden">
                {/* Animated network nodes */}
                <motion.div
                  className="absolute top-[20%] left-[20%]"
                  animate={{
                    y: [0, 10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <div className="clay-server">
                    <div className="clay-node-inner">
                      <Server className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  className="absolute top-[60%] left-[60%]"
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 0.5,
                  }}
                >
                  <div className="clay-client">
                    <div className="clay-node-inner">
                      <Computer className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  className="absolute top-[30%] left-[70%]"
                  animate={{
                    y: [0, 8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 1,
                  }}
                >
                  <div className="clay-attacker">
                    <div className="clay-node-inner">
                      <AlertCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </motion.div>
                
                {/* Connection lines */}
                <div className="absolute top-[25%] left-[25%] w-[35%] h-[40%]">
                  <div className="absolute left-0 top-0 w-full h-[2px] bg-clay-blue transform rotate-[30deg] origin-left"></div>
                  <motion.div
                    className="absolute w-3 h-3 rounded-full bg-clay-blue"
                    style={{ left: "35%", top: "-1.5px" }}
                    animate={{
                      x: [0, 100, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "loop",
                    }}
                  />
                </div>
                
                <div className="absolute top-[35%] left-[75%] w-[20%] h-[10%]">
                  <div className="absolute left-0 top-0 w-full h-[2px] bg-clay-red transform rotate-[-60deg] origin-left"></div>
                  <motion.div
                    className="absolute w-3 h-3 rounded-full bg-clay-red"
                    style={{ left: "50%", top: "-1.5px" }}
                    animate={{
                      x: [-20, 20, -20],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-lg text-clay-neutral-400 mb-8">
            Jump into the simulator or explore our educational resources to begin your journey into network security and cryptography.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/simulator"
              className="clay-button clay-button-primary flex items-center justify-center gap-2"
            >
              <span>Launch Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link
              to="/about"
              className="clay-button flex items-center justify-center gap-2"
            >
              <span>Learn More</span>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    className="clay-card p-6"
  >
    <div className="bg-clay-purple/10 w-14 h-14 rounded-full flex items-center justify-center mb-4">
      <Icon className="w-7 h-7 text-clay-purple" />
    </div>
    
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-clay-neutral-400">{description}</p>
  </motion.div>
);

export default Index;
