
'use client'

import { SplineScene } from "@/components/ui/spline";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
 
export function SplineSceneBasic() {
  return (
    <Card className="w-full h-[500px] bg-background/[0.96] relative overflow-hidden clay-card group transform-gpu transition-all duration-500">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20 group-hover:opacity-70 transition-all duration-500"
        fill="hsl(var(--foreground))"
      />
      
      <div className="flex h-full">
        <div className="flex-1 p-8 relative z-10 flex flex-col justify-center transform-gpu transition-all duration-500 group-hover:translate-x-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/40 group-hover:scale-105 group-hover:tracking-wider transition-all duration-500">
            Interactive 3D Website
          </h1>
          <p className="mt-4 text-muted-foreground max-w-lg group-hover:text-foreground transition-all duration-500 group-hover:translate-x-2">
            🚧 Under Construction by BytesSizedShrey (Shreyash Gajbhiye)
            Something awesome is in the oven—trust me, it's gonna be worth the wait. Stay tuned, the future's loading...

            Till then spend some time with my Robo, He's alone here.
          </p>
        </div>

        <div className="flex-1 relative transform-gpu transition-all duration-500 group-hover:scale-105 group-hover:rotate-2">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}

