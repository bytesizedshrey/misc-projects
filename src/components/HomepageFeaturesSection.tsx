
import { motion } from "framer-motion";
import { Server, Lock, AlertCircle } from "lucide-react";

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

const HomepageFeaturesSection = () => (
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
);

export default HomepageFeaturesSection;
