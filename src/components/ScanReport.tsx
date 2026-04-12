import { ArrowLeft, Download, Shield, AlertTriangle, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VulnerabilityCard } from "./VulnerabilityCard";
import type { ScanResult, SeverityLevel } from "@/lib/scanner";

interface ScanReportProps {
  result: ScanResult;
  onBack: () => void;
  onExportPdf: () => void;
}

export function ScanReport({ result, onBack, onExportPdf }: ScanReportProps) {
  const severityCounts = result.vulnerabilities.reduce((acc, v) => {
    acc[v.severity] = (acc[v.severity] || 0) + 1;
    return acc;
  }, {} as Record<SeverityLevel, number>);

  const gradeColor = result.totalScore >= 80 ? "text-cyber-green" : result.totalScore >= 60 ? "text-cyber-yellow" : "text-cyber-red";

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="cyber-ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> New Scan
        </Button>
        <Button variant="cyber-outline" onClick={onExportPdf}>
          <Download className="w-4 h-4 mr-2" /> Export PDF
        </Button>
      </div>

      {/* Score Overview */}
      <div className="rounded-lg border border-border bg-card p-6 mb-6 cyber-gradient">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="text-center">
            <div className={`text-6xl font-bold font-mono ${gradeColor}`}>{result.grade}</div>
            <div className="text-muted-foreground text-sm mt-1">Security Grade</div>
          </div>
          <div className="h-16 w-px bg-border hidden md:block" />
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold font-mono text-foreground">{result.totalScore}</div>
              <div className="text-xs text-muted-foreground">Score / 100</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-foreground">{result.vulnerabilities.length}</div>
              <div className="text-xs text-muted-foreground">Issues Found</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-sm font-mono">{(result.duration / 1000).toFixed(1)}s</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Duration</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Globe className="w-3.5 h-3.5" />
                <span className="text-sm font-mono truncate max-w-[120px]">{new URL(result.url).hostname}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Target</div>
            </div>
          </div>
        </div>
      </div>

      {/* Severity Summary */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {(["critical", "high", "medium", "low", "info"] as SeverityLevel[]).map((sev) => (
          <div key={sev} className="rounded-md border border-border bg-card p-3 text-center">
            <div className={`text-lg font-bold font-mono ${
              sev === "critical" ? "text-cyber-red" :
              sev === "high" ? "text-cyber-orange" :
              sev === "medium" ? "text-cyber-yellow" :
              sev === "low" ? "text-cyber-blue" : "text-muted-foreground"
            }`}>
              {severityCounts[sev] || 0}
            </div>
            <div className="text-xs text-muted-foreground capitalize">{sev}</div>
          </div>
        ))}
      </div>

      {/* Vulnerabilities */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          Findings ({result.vulnerabilities.length})
        </h2>
        {result.vulnerabilities
          .sort((a, b) => {
            const order: Record<SeverityLevel, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
            return order[a.severity] - order[b.severity];
          })
          .map((vuln, i) => (
            <VulnerabilityCard key={vuln.id} vulnerability={vuln} index={i} />
          ))}
        {result.vulnerabilities.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-3 text-cyber-green" />
            <p>No vulnerabilities detected. Great security posture!</p>
          </div>
        )}
      </div>
    </div>
  );
}
