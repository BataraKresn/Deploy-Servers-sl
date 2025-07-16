"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, ServerIcon, User, Globe, FolderGit2, KeyRound } from "lucide-react"

interface Server {
  id: string
  name: string
  alias: string
  user: string
  ip: string
  path: string
}

export default function DeployPage() {
  const [servers, setServers] = useState<Server[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedServer, setSelectedServer] = useState<Server | null>(null)
  const [token, setToken] = useState("")
  const [privateKey, setPrivateKey] = useState("")
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployError, setDeployError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const res = await fetch("/api/servers")
        const text = await res.text()
        let parsed: any
        try {
          parsed = JSON.parse(text)
        } catch {
          throw new Error(text || "Invalid response from server")
        }
        if (!res.ok) {
          throw new Error(parsed.detail || "Failed to fetch servers")
        }
        setServers(parsed)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchServers()
  }, [])

  const handleDeployClick = (server: Server) => {
    setSelectedServer(server)
    setDeployError(null)
    setToken("")
    setPrivateKey("")
    setIsModalOpen(true)
  }

  const handleDeploySubmit = async () => {
    if (!selectedServer) return
    setIsDeploying(true)
    setDeployError(null)
    try {
      const payload: { token: string; serverId: string; privateKey?: string } = {
        token,
        serverId: selectedServer.id,
      }
      if (privateKey.trim()) {
        payload.privateKey = privateKey
      }

      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Deployment failed")
      router.push(`/result/${data.log_file}`)
    } catch (err: any) {
      setDeployError(err.message)
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <Button asChild variant="link" className="px-0 mb-4">
        <Link href="/">&larr; Back to Home</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Deploy to a Server</CardTitle>
          <CardDescription>Select a server to begin the deployment process.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {servers.map((server) => (
                <Card key={server.id} className="flex flex-col justify-between">
                  <div>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ServerIcon className="h-5 w-5 text-gray-500" />
                        {server.name}
                      </CardTitle>
                      <CardDescription>{server.alias}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>{server.ip}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{server.user}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="h-4 w-4" />
                        <span className="truncate">{server.path}</span>
                      </div>
                    </CardContent>
                  </div>
                  <CardFooter>
                    <Button className="w-full mt-4" onClick={() => handleDeployClick(server)}>
                      Deploy
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Deploy to {selectedServer?.name}</DialogTitle>
            <DialogDescription>Enter your credentials to authorize this deployment.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="token">Secret Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="Your secret token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="privateKey">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  SSH Private Key (Optional)
                </div>
              </Label>
              <Textarea
                id="privateKey"
                placeholder="Paste your SSH private key here if needed..."
                className="font-mono text-xs h-32"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The key will only be used for this session and not stored.
              </p>
            </div>
            {deployError && <p className="text-red-500 text-sm mt-2">{deployError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeploySubmit} disabled={isDeploying || !token}>
              {isDeploying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeploying ? "Deploying..." : "Authorize & Deploy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
