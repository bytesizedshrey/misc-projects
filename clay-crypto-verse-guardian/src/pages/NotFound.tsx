
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { Home, Search } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="clay-card p-8 md:p-12 max-w-lg"
        >
          <div className="bg-clay-neutral-100/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Search className="w-12 h-12 text-clay-purple/60" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-clay-purple-dark to-clay-purple bg-clip-text text-transparent">
            404 - Page Not Found
          </h1>
          
          <p className="text-lg text-clay-neutral-400 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <Link
            to="/"
            className="clay-button clay-button-primary flex items-center justify-center gap-2 mx-auto"
          >
            <Home className="w-5 h-5" />
            <span>Return Home</span>
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
};

export default NotFound;
