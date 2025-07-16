"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ResultPage({ params }: { params: { log_file: string } }) {
  const { log_file } = params
  const [fullLog, setFullLog] = useState("Loading full log...")
  const [streamedLog, setStreamedLog] = useState<string[]>([])
  const streamRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    if (!log_file) return

    // Fetch the full log initially
    const fetchFullLog = async () => {
      try {
        const res = await fetch(`/api/logs/${log_file}`)
        if (!res.ok) throw new Error("Log file not found or server error")
        const text = await res.text()
        setFullLog(text)
      } catch {
        setFullLog("Failed to load full log.")
      }
    }
    fetchFullLog()

    // Set up the event source for live streaming
    const eventSource = new EventSource(`/api/stream-log?file=${log_file}`)
    eventSource.onmessage = (event) => {
      setStreamedLog((prev) => [...prev, event.data])
    }
    eventSource.onerror = () => {
      setStreamedLog((prev) => [...prev, "--- Stream ended or an error occurred ---"])
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [log_file])

  useEffect(() => {
    // Auto-scroll the log view
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight
    }
  }, [streamedLog])

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <Button asChild variant="link" className="px-0 mb-4">
        <Link href="/deploy">&larr; Back to Deployments</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-green-600 dark:text-green-400">✅ Deployment Triggered!</CardTitle>
          <CardDescription>
            Log File: <strong>{log_file}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">🔄 Real-time Log Stream</h3>
            <pre
              ref={streamRef}
              className="bg-gray-900 text-green-400 p-4 rounded-md h-80 overflow-y-auto text-xs font-mono"
            >
              {streamedLog.join("\n")}
            </pre>
          </div>
          <div>
            <h3 className="font-semibold mb-2">📄 Full Static Log</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md h-60 overflow-y-auto text-xs font-mono">
              {fullLog}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
