
"use client"
import React from "react"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogDescription, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Globe, Rocket, Server, FileText, HeartPulse, Loader2 } from "lucide-react"

export default function HomePage() {
  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [healthTarget, setHealthTarget] = useState("")
  const [healthResult, setHealthResult] = useState<any>(null)
  const [isHealthLoading, setIsHealthLoading] = useState(false)

  const [logs, setLogs] = useState<string[]>([])
  const [logContent, setLogContent] = useState("")
  const [isLogsLoading, setIsLogsLoading] = useState(false)
  const [isLogContentLoading, setIsLogContentLoading] = useState(false)
  const [showFull, setShowFull] = useState(false);
  const displayedPing = healthResult?.ping_output
    ? (showFull ? healthResult.ping_output : healthResult.ping_output.slice(0, 500))
    : "";
  
  const handleCheckHealth = async () => {
    setIsHealthLoading(true)
    setHealthResult(null)
    const target = healthTarget || "google.co.id"
    try {
      const res = await fetch(`/api/health?target=${target}`)
      const data = await res.json()
      setHealthResult(data)
    } catch (error) {
      setHealthResult({ error: "Failed to fetch health status." })
    } finally {
      setIsHealthLoading(false)
    }
  }

  const handleBrowseLogs = async () => {
    setIsLogsLoading(true)
    try {
      const res = await fetch("/api/logs")
      const data = await res.json()
      setLogs(data)
    } catch (error) {
      setLogs([])
    } finally {
      setIsLogsLoading(false)
    }
  }

  const handleViewLog = async (logFile: string) => {
    setIsLogContentLoading(true)
    setLogContent("")
    try {
      const res = await fetch(`/api/logs/${logFile}`)
      const text = await res.text()
      setLogContent(text)
    } catch (error) {
      setLogContent("Failed to load log content.")
    } finally {
      setIsLogContentLoading(false)
    }
  }

  // Handler untuk submit password
  const handlePasswordSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsPasswordLoading(true);
    setPasswordError("");
    try {
      const res = await fetch("/api/validate-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.valid) {
        setIsPasswordValid(true);
        setPasswordError("");
      } else {
        setIsPasswordValid(false);
        setPasswordError("Password salah!");
      }
    } catch {
      setIsPasswordValid(false);
      setPasswordError("Gagal validasi password.");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800">
        <CardHeader className="text-center">
          <div className="mx-auto inline-block bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full mb-4">
            <Rocket className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">Trigger Deploy</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Welcome to your deployment dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 grid gap-4">
          {/* Form password */}
          {!isPasswordValid && (
            <form className="mb-4" onSubmit={handlePasswordSubmit}>
              <label htmlFor="deploy-password" className="block text-sm font-medium mb-1 text-left">Masukkan Password:</label>
              <Input
                id="deploy-password"
                type="password"
                className="w-full max-w-xs mb-2"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                disabled={isPasswordLoading}
                autoFocus
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    handlePasswordSubmit(e);
                  }
                }}
              />
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isPasswordLoading || !password}
              >
                {isPasswordLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
              </Button>
              {passwordError && <div className="text-red-500 text-xs mt-2">{passwordError}</div>}
            </form>
          )}
          {/* Tombol Go to Deployments hanya aktif jika password valid */}
          <Link href="/deploy" passHref>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg h-16"
              disabled={!isPasswordValid}
            >
              <Server className="mr-2 h-6 w-6" /> Go to Deployments
            </Button>
          </Link>
          <div className="grid grid-cols-2 gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full h-20 bg-transparent" onClick={handleBrowseLogs}>
                  <FileText className="mr-2 h-5 w-5" /> Logs
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[80vh]" aria-describedby="logs-dialog-desc">
                <DialogHeader>
                  <DialogTitle>Deployment Logs</DialogTitle>
                  <DialogDescription id="logs-dialog-desc">
                    Browse and view deployment log files.
                  </DialogDescription>
                </DialogHeader>
                {isLogsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4 h-full overflow-hidden">
                    <div className="flex flex-col border-r pr-2">
                      <h4 className="font-semibold mb-2">Log Files</h4>
                      <ul className="space-y-1 overflow-y-auto">
                        {Array.isArray(logs) && logs.length > 0 ? (
                          logs.map((log) => (
                            <li key={log}>
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-left h-auto py-1.5"
                                onClick={() => handleViewLog(log)}
                              >
                                {log}
                              </Button>
                            </li>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {isLogsLoading ? "Loading…" : "No log files found."}
                          </p>
                        )}
                      </ul>
                    </div>
                    <div className="overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 rounded-md h-full">
                      {isLogContentLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : (
                        <pre className="text-xs whitespace-pre-wrap">
                          {logContent || "Select a log file to view its content."}
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full h-20 bg-transparent">
                  <HeartPulse className="mr-2 h-5 w-5" /> Health
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-[95vw] sm:max-w-lg overflow-x-auto" aria-describedby="health-dialog-desc">
                <DialogHeader>
                  <DialogTitle>System Health Check</DialogTitle>
                  <DialogDescription id="health-dialog-desc">
                    Check server health by domain. Example: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">google.co.id</span>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Input
                      className="w-full max-w-xs"
                      placeholder="Domain (e.g., google.co.id)"
                      value={healthTarget}
                      onChange={(e) => setHealthTarget(e.target.value)}
                    />
                    <Button className="w-full sm:w-auto" onClick={handleCheckHealth} disabled={isHealthLoading}>
                      {isHealthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Run"}
                    </Button>
                  </div>
                  {healthResult?.ping_output || healthResult?.dns_output ? (
                    <div className="space-y-4">
                      {/* Info Target & Resolved IP */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base font-semibold text-gray-700 dark:text-gray-200">
                          <span className="inline-flex items-center gap-1">
                            <span className="text-blue-500"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span>
                            Target:
                          </span>
                          <span className="font-bold ml-1">{healthTarget || "google.co.id"}</span>
                        </span>
                      </div>
                      {healthResult?.dns_output && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-blue-600"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41m12.02 0l-1.41-1.41M6.34 6.34L4.93 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span>
                          <span className="text-base text-gray-700 dark:text-gray-200">{(healthResult.dns_output.match(/\d+\.\d+\.\d+\.\d+/) || [])[0] ? `${healthTarget || "google.co.id"} resolved to ${(healthResult.dns_output.match(/\d+\.\d+\.\d+\.\d+/) || [])[0]}` : null}</span>
                        </div>
                      )}
                      {/* Output Box */}
                      {healthResult?.ping_output && (
                        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md border w-full max-w-full">
                          <div className="overflow-x-auto">
                            <pre className="text-xs whitespace-pre-wrap max-h-60 overflow-y-auto">
                              {showFull
                                ? healthResult.ping_output
                                : healthResult.ping_output.slice(0, 1000) + (healthResult.ping_output.length > 1000 ? "..." : "")}
                            </pre>
                          </div>
                          {healthResult.ping_output.length > 1000 && (
                            <button
                              onClick={() => setShowFull(!showFull)}
                              className="text-blue-500 text-xs mt-1 underline"
                            >
                              {showFull ? "Show Less" : "Show More"}
                            </button>
                          )}
                        </div>
                      )}
                      {/* DNS Output Box */}
                      {healthResult?.dns_output && (
                        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md border w-full max-w-full mt-2">
                          <div className="overflow-x-auto">
                            <pre className="text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
                              {healthResult.dns_output}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
