"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Lock } from "lucide-react"
import { useState, useMemo } from "react"

interface Endpoint {
  id: string
  method: string
  path: string
  name: string
  description: string
  requiresAuth: boolean
}

interface ApiSidebarProps {
  endpoints: Endpoint[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const methodColors: Record<string, string> = {
  GET: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  POST: "bg-green-500/10 text-green-500 border-green-500/20",
  PUT: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
  PATCH: "bg-purple-500/10 text-purple-500 border-purple-500/20",
}

export function ApiSidebar({ endpoints, selectedId, onSelect }: ApiSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredEndpoints = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return endpoints.filter(
      (endpoint) =>
        endpoint.name.toLowerCase().includes(query) ||
        endpoint.path.toLowerCase().includes(query) ||
        endpoint.method.toLowerCase().includes(query),
    )
  }, [endpoints, searchQuery])

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-sidebar">
      <div className="border-b border-sidebar-border p-4">
        <h2 className="text-lg font-semibold text-sidebar-foreground mb-3">API Endpoints</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search endpoints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredEndpoints.map((endpoint) => (
            <button
              key={endpoint.id}
              onClick={() => onSelect(endpoint.id)}
              className={`w-full text-left rounded-md p-3 transition-colors ${
                selectedId === endpoint.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className={`text-xs font-mono font-semibold px-2 ${methodColors[endpoint.method]}`}
                >
                  {endpoint.method}
                </Badge>
                {endpoint.requiresAuth && <Lock className="h-3 w-3 text-warning" />}
              </div>
              <div className="font-medium text-sm mb-1">{endpoint.name}</div>
              <div className="text-xs text-muted-foreground font-mono truncate">{endpoint.path}</div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
