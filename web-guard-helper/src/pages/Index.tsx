import { useState, useCallback } from "react";
import { ScanInput } from "@/components/ScanInput";
import { ScanProgress } from "@/components/ScanProgress";
import { ScanReport } from "@/components/ScanReport";
import { ScanHistory } from "@/components/ScanHistory";
import { scanUrl, type ScanResult, type ScanProgress as ScanProgressType } from "@/lib/scanner";
import { toast } from "sonner";

type AppState = "input" | "scanning" | "report";

const Index = () => {
  const [state, setState] = useState<AppState>("input");
  const [progress, setProgress] = useState<ScanProgressType>({ phase: "", percent: 0 });
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>(() => {
    try {
      const saved = localStorage.getItem("scan-history");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((s: ScanResult) => ({ ...s, timestamp: new Date(s.timestamp) }));
      }
    } catch {}
    return [];
  });

  const saveHistory = useCallback((newHistory: ScanResult[]) => {
    setHistory(newHistory);
    localStorage.setItem("scan-history", JSON.stringify(newHistory.slice(0, 20)));
  }, []);

  const handleScan = useCallback(async (url: string) => {
    setState("scanning");
    setProgress({ phase: "Initializing scan...", percent: 0 });

    try {
      const result = await scanUrl(url, setProgress);
      setCurrentResult(result);
      saveHistory([result, ...history]);
      setState("report");
      toast.success(`Scan complete: ${result.vulnerabilities.length} issues found`);
    } catch (err) {
      toast.error("Scan failed. Please check the URL and try again.");
      setState("input");
    }
  }, [history, saveHistory]);

  const handleExportPdf = useCallback(() => {
    if (!currentResult) return;
    // Simple text-based export for now
    const lines = [
      "OWASP TOP 10 VULNERABILITY SCAN REPORT",
      "=".repeat(50),
      `Target: ${currentResult.url}`,
      `Date: ${currentResult.timestamp.toLocaleString()}`,
      `Score: ${currentResult.totalScore}/100 (Grade: ${currentResult.grade})`,
      `Vulnerabilities Found: ${currentResult.vulnerabilities.length}`,
      "",
      "FINDINGS:",
      "-".repeat(50),
    ];

    for (const v of currentResult.vulnerabilities) {
      lines.push(`\n[${v.severity.toUpperCase()}] ${v.title} (CVSS: ${v.cvssScore})`);
      lines.push(`OWASP: ${v.owaspCode} - ${v.owaspCategory}`);
      lines.push(`Description: ${v.description}`);
      lines.push(`PoC: ${v.proofOfConcept}`);
      lines.push(`Fix: ${v.suggestedFix}`);
      lines.push("-".repeat(50));
    }

    lines.push("\nDisclaimer: For educational and authorized testing only.");

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `scan-report-${new URL(currentResult.url).hostname}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Report downloaded");
  }, [currentResult]);

  return (
    <div className="min-h-screen bg-background grid-bg scanline">
      <div className="relative z-10 px-4 py-12 md:py-20">
        {state === "input" && (
          <>
            <ScanInput onScan={handleScan} isScanning={false} />
            <ScanHistory
              history={history}
              onSelect={(result) => { setCurrentResult(result); setState("report"); }}
              onClear={() => saveHistory([])}
            />
          </>
        )}

        {state === "scanning" && <ScanProgress progress={progress} />}

        {state === "report" && currentResult && (
          <ScanReport
            result={currentResult}
            onBack={() => setState("input")}
            onExportPdf={handleExportPdf}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
