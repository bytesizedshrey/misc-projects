
import React, { useState, useEffect } from "react";
import { SparklesPreviewDark } from "@/components/ui/sparkles-preview";
import { SplineSceneBasic } from "@/components/ui/spline-demo";

const Index = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // Reduced from 7 seconds to 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SparklesPreviewDark />;
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Welcome to Your App</h1>
          <p className="text-xl text-gray-600 mb-8">Explore our interactive 3D experiences</p>
        </div>
        
        <div className="mb-16">
          <SplineSceneBasic />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Feature One</h2>
            <p className="text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam at varius eros, 
              vitae convallis nisi. Suspendisse potenti.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Feature Two</h2>
            <p className="text-gray-600">
              Praesent bibendum nisl ut diam finibus, vitae lacinia elit aliquam. Etiam 
              dignissim bibendum tellus, ac fringilla dolor efficitur ut.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
