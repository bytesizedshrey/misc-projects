
"use client";
import React from "react";
import { SparklesCore } from "./sparkles";

export function SparklesPreviewDark() {
  return (
    <div className="min-h-screen w-full fixed inset-0 bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      <div className="w-full absolute inset-0 h-screen">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
          speed={1}
        />
      </div>
      <h1 className="md:text-7xl text-3xl lg:text-9xl font-bold text-center text-white relative z-20">
        ByteSizedShrey
      </h1>
    </div>
  )
}
