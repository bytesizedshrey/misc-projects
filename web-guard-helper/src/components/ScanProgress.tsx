import { Shield } from "lucide-react";
import type { ScanProgress as ScanProgressType } from "@/lib/scanner";

interface ScanProgressProps {
  progress: ScanProgressType;
}

export function ScanProgress({ progress }: ScanProgressProps) {
  return (
    <div className="w-full max-w-xl mx-auto text-center animate-fade-in-up">
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="45"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${progress.percent * 2.83} 283`}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield className="w-8 h-8 text-primary animate-pulse" />
        </div>
      </div>
      <p className="font-mono text-primary text-sm mb-2">{progress.percent}%</p>
      <p className="text-muted-foreground text-sm">{progress.phase}</p>
      <div className="mt-4 h-1 bg-secondary rounded-full overflow-hidden max-w-xs mx-auto">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  );
}
