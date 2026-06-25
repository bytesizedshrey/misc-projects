
import { Canvas, useFrame } from "@react-three/fiber";
import React, { Suspense, useRef } from "react";
import * as THREE from "three";

function SpinningCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Animate rotation with React Three Fiber's useFrame
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[0.8, 0.6, 0]}
      position={[0, 0, 0]}
      scale={1.25}
      castShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#9b87f5" roughness={0.35} metalness={0.45} />
    </mesh>
  );
}

const Homepage3dDemo = () => (
  <div className="h-48 md:h-60 w-full mx-auto flex justify-center items-center glass-morphism rounded-2xl mb-6 shadow-xl overflow-hidden border border-white/20 relative">
    <Canvas camera={{ position: [2, 2, 3], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 6]} intensity={0.7} />
      <Suspense fallback={null}>
        <SpinningCube />
      </Suspense>
    </Canvas>
    <span className="absolute left-2 bottom-2 bg-black/40 px-2 py-1 text-xs rounded-xl text-white pointer-events-none">
      3D Secure Node
    </span>
  </div>
);

export default Homepage3dDemo;
