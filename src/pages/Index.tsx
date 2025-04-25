
import React, { useState, useEffect } from "react";
import { SparklesPreviewDark } from "@/components/ui/sparkles-preview";
import { SplineSceneBasic } from "@/components/ui/spline-demo";
import { FloatingEmojis } from "@/components/ui/floating-emojis";

const Index = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SparklesPreviewDark />;
  }

  return (
    <>
      <div className="animated-bg" />
      <FloatingEmojis />
      <div className="min-h-screen w-full py-12 px-4 sm:px-6 lg:px-8 overflow-auto relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 clay-card p-8">
            <h1 className="text-4xl font-bold mb-4 text-gradient hover:scale-105 transition-transform">
              Welcome to BytesSizedShrey
            </h1>
            <p className="text-xl text-gray-600 mb-8 hover:text-gray-800 transition-colors">
              Play with my interactive 3D Robot
            </p>
          </div>
          
          <div className="mb-16 hover:scale-[1.01] transition-transform">
            <SplineSceneBasic />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="clay-card p-8 group">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 group-hover:text-gradient transition-all">
                Feature One
              </h2>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors">
                Meowww!!!
              </p>
            </div>
            
            <div className="clay-card p-8 group">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 group-hover:text-gradient transition-all">
                Feature Two
              </h2>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors">
                Wooff!!!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
