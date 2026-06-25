
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Server, Computer, AlertCircle, ArrowRight } from "lucide-react";

const HomepageLearningSection = () => (
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
);

export default HomepageLearningSection;
