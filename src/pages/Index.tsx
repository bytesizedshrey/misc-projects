
import React, { useState, useEffect } from "react";
import { SparklesPreviewDark } from "@/components/ui/sparkles-preview";

const Index = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 7000); // 7 seconds

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SparklesPreviewDark />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your App</h1>
        <p className="text-xl text-gray-600">Main content will be added here</p>
      </div>
    </div>
  );
};

export default Index;
