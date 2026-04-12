import { useState } from "react";
import { Shield, Globe, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScanInputProps {
  onScan: (url: string) => void;
  isScanning: boolean;
}

export function ScanInput({ onScan, isScanning }: ScanInputProps) {
  const [url, setUrl] = useState("");
  const [apiRequest, setApiRequest] = useState("");

  const handleUrlScan = () => {
    if (!url.trim()) return;
    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }
    onScan(targetUrl);
  };

  const handleApiScan = () => {
    if (!apiRequest.trim()) return;
    // Extract URL from the request
    const lines = apiRequest.trim().split("\n");
    const firstLine = lines[0];
    const urlMatch = firstLine.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      onScan(urlMatch[0]);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-mono mb-6">
          <Shield className="w-4 h-4" />
          OWASP Top 10 Scanner
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-cyber">
          Vulnerability Scanner
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Analyze websites and APIs for OWASP Top 10 security vulnerabilities. 
          Enter a URL to begin your security assessment.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-1 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <Tabs defaultValue="url">
          <TabsList className="w-full bg-secondary/50">
            <TabsTrigger value="url" className="flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Globe className="w-4 h-4 mr-2" /> URL Scan
            </TabsTrigger>
            <TabsTrigger value="api" className="flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <FileText className="w-4 h-4 mr-2" /> API Request
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Upload className="w-4 h-4 mr-2" /> Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="p-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrlScan()}
                className="flex-1 bg-secondary/50 border border-border rounded-md px-4 py-2.5 text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                disabled={isScanning}
              />
              <Button variant="cyber" onClick={handleUrlScan} disabled={isScanning || !url.trim()}>
                {isScanning ? "Scanning..." : "Scan"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="api" className="p-4">
            <textarea
              placeholder={"GET https://api.example.com/users\nAuthorization: Bearer token123\nContent-Type: application/json"}
              value={apiRequest}
              onChange={(e) => setApiRequest(e.target.value)}
              className="w-full h-32 bg-secondary/50 border border-border rounded-md px-4 py-2.5 text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-none"
              disabled={isScanning}
            />
            <Button variant="cyber" className="mt-3 w-full" onClick={handleApiScan} disabled={isScanning || !apiRequest.trim()}>
              {isScanning ? "Scanning..." : "Analyze Request"}
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="p-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">
                Drop request log files here or click to browse
              </p>
              <p className="text-muted-foreground/50 text-xs mt-1">
                Supports .har, .txt, .log files
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <p className="text-center text-xs text-muted-foreground/60 mt-4 font-mono">
        ⚠ For educational and authorized testing only. Do not scan targets without permission.
      </p>
    </div>
  );
}
