import { Clock, Globe, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScanResult } from "@/lib/scanner";

interface ScanHistoryProps {
  history: ScanResult[];
  onSelect: (result: ScanResult) => void;
  onClear: () => void;
}

export function ScanHistory({ history, onSelect, onClear }: ScanHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4" /> Recent Scans
        </h3>
        <Button variant="cyber-ghost" size="sm" onClick={onClear}>
          <Trash2 className="w-3 h-3 mr-1" /> Clear
        </Button>
      </div>
      <div className="space-y-2">
        {history.slice(0, 5).map((scan) => {
          const gradeColor = scan.totalScore >= 80 ? "text-cyber-green" : scan.totalScore >= 60 ? "text-cyber-yellow" : "text-cyber-red";
          return (
            <button
              key={scan.id}
              onClick={() => onSelect(scan)}
              className="w-full flex items-center justify-between p-3 rounded-md border border-border bg-card hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-mono text-foreground truncate">{scan.url}</p>
                  <p className="text-xs text-muted-foreground">
                    {scan.timestamp.toLocaleString()} · {scan.vulnerabilities.length} issues
                  </p>
                </div>
              </div>
              <span className={`font-bold font-mono text-lg ${gradeColor}`}>{scan.grade}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
