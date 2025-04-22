
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, ArrowRight } from "lucide-react";
import Homepage3dDemo from "./Homepage3dDemo";

const HomepageHeroSection = () => (
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
);

export default HomepageHeroSection;
