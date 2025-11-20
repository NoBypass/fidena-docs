
"use client"

import { useState, useEffect } from "react"
import { ApiSidebar } from "@/components/api-sidebar"
import { EndpointDetails } from "@/components/endpoint-details"
import { ApiTester } from "@/components/api-tester"
import { AuthDialog } from "@/components/auth-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Fingerprint, LogOut, Menu, X, Globe } from "lucide-react"
import { isAuthenticated, signOut } from "@/lib/passkey-auth"

export default function ApiDocumentation() {
  const [apiSchema, setApiSchema] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [baseUrl, setBaseUrl] = useState("http://localhost:8080")

  useEffect(() => {
    setAuthenticated(isAuthenticated())

    const fetchApiSchema = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:8080/docs')

        if (!response.ok) {
          throw new Error('Failed to fetch API schema')
        }

        const data = await response.json()
        setApiSchema(data)

        if (data.endpoints && data.endpoints.length > 0) {
          setSelectedEndpointId(data.endpoints[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchApiSchema()
  }, [])

  const selectedEndpoint = apiSchema?.endpoints.find((e: any) => e.id === selectedEndpointId)

  const handleAuthSuccess = () => {
    setAuthenticated(true)
  }

  const handleSignOut = () => {
    signOut()
    setAuthenticated(false)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading API documentation...</p>
      </div>
    )
  }

  // Error state
  if (error || !apiSchema) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-destructive">{error || 'Failed to load API schema'}</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div>
              <h1 className="text-xl font-bold">{apiSchema.info.title}</h1>
              <p className="text-sm text-muted-foreground">{apiSchema.info.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 max-w-xs">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="https://api.example.com"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>
            {authenticated ? (
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Button onClick={() => setAuthDialogOpen(true)} size="sm">
                <Fingerprint className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
        {/* Mobile base URL input */}
        <div className="md:hidden px-4 pb-3 flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="https://api.example.com"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="h-9 text-sm font-mono"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`w-80 flex-shrink-0 ${
            sidebarOpen ? "absolute inset-y-0 left-0 z-50" : "hidden"
          } lg:relative lg:block`}
        >
          <ApiSidebar
            endpoints={apiSchema.endpoints}
            selectedId={selectedEndpointId}
            onSelect={(id) => {
              setSelectedEndpointId(id)
              setSidebarOpen(false)
            }}
          />
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {selectedEndpoint ? (
            <>
              <EndpointDetails endpoint={selectedEndpoint} isAuthenticated={authenticated} />
              <ApiTester endpoint={selectedEndpoint} isAuthenticated={authenticated} baseUrl={baseUrl} />            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Select an endpoint to view documentation</p>
            </div>
          )}
        </main>
      </div>

      {/* Auth Dialog */}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} onAuthSuccess={handleAuthSuccess} />
    </div>
  )
}