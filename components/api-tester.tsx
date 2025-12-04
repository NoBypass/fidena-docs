"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Play, Lock, AlertCircle } from "lucide-react"
import { CodeBlock } from "./code-block"

interface Parameter {
  name: string
  type: string
  in: string
  required: boolean
  description: string
  default?: any
}

interface RequestBody {
  required: boolean
  content: Record<
    string,
    {
      type: string
      required: boolean
      description: string
      default?: any
    }
  >
}

interface Endpoint {
  id: string
  method: string
  path: string
  name: string
  requiresAuth: boolean
  parameters: Parameter[]
  requestBody?: RequestBody
}

interface ApiTesterProps {
  endpoint: Endpoint
  isAuthenticated: boolean
  baseUrl: string
}

export function ApiTester({ endpoint, isAuthenticated, baseUrl }: ApiTesterProps) {
  const [paramValues, setParamValues] = useState<Record<string, string>>({})
  const [bodyValue, setBodyValue] = useState("")
  const [response, setResponse] = useState<{ status: number; data: any; statusText?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canExecute = !endpoint.requiresAuth || isAuthenticated

  const handleTest = async () => {
    setLoading(true)
    setResponse(null)
    setError(null)

    try {
      let path = endpoint.path
      endpoint.parameters.forEach((param) => {
        if (param.in === "path") {
          path = path.replace(`{${param.name}}`, paramValues[param.name] || "1")
        }
      })

      const queryParams = endpoint.parameters
        .filter((p) => p.in === "query" && paramValues[p.name])
        .map((p) => `${p.name}=${encodeURIComponent(paramValues[p.name])}`)
        .join("&")

      const fullUrl = `${baseUrl}${path}${queryParams ? `?${queryParams}` : ""}`

      const fetchOptions: RequestInit = {
        method: endpoint.method,
        headers: {
          "Content-Type": "application/json",
        },
      }

      if (isAuthenticated) {
        fetchOptions.headers = {
          ...fetchOptions.headers,
        }
      }

      if (["POST", "PUT", "PATCH"].includes(endpoint.method) && bodyValue) {
        try {
          fetchOptions.body = JSON.stringify(JSON.parse(bodyValue))
        } catch (e) {
          throw new Error("Invalid JSON in request body")
        }
      }

      const res = await fetch(fullUrl, fetchOptions)

      let data: any
      const contentType = res.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        data = await res.json()
      } else {
        const text = await res.text()
        data = text || null
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
      })
    } catch (err: any) {
      setError(err.message || "Failed to fetch")
      setResponse({
        status: 0,
        statusText: "Network Error",
        data: {
          error: err.message || "Failed to fetch",
          message: "The request could not be completed. Check the base URL and endpoint configuration.",
        },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Test Endpoint
        </CardTitle>
        <CardDescription>
          {canExecute
            ? "Configure parameters and test the API endpoint"
            : "Sign in with a passkey to test this endpoint"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!canExecute && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start gap-3">
            <Lock className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <p className="font-medium text-warning">Authentication Required</p>
              <p className="text-sm text-muted-foreground mt-1">
                This endpoint requires authentication. Please sign in to test it.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Request Failed</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        )}

        {endpoint.parameters.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold">Parameters</h4>
            {endpoint.parameters.map((param) => (
              <div key={param.name} className="space-y-2">
                <Label htmlFor={param.name} className="flex items-center gap-2">
                  <span className="font-mono">{param.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {param.type}
                  </Badge>
                  {param.required && (
                    <Badge variant="destructive" className="text-xs">
                      required
                    </Badge>
                  )}
                </Label>
                <Input
                  id={param.name}
                  placeholder={param.description}
                  value={paramValues[param.name] || ""}
                  onChange={(e) => setParamValues({ ...paramValues, [param.name]: e.target.value })}
                  disabled={!canExecute}
                />
              </div>
            ))}
          </div>
        )}

        {endpoint.requestBody && (
          <div className="space-y-2">
            <Label htmlFor="body">Request Body (JSON)</Label>
            <Textarea
              id="body"
              placeholder={JSON.stringify(
                Object.fromEntries(
                  Object.entries(endpoint.requestBody.content).map(([key, field]) => [
                    key,
                    field.default || `<${field.type}>`,
                  ]),
                ),
                null,
                2,
              )}
              value={bodyValue}
              onChange={(e) => setBodyValue(e.target.value)}
              className="font-mono text-sm min-h-[150px]"
              disabled={!canExecute}
            />
          </div>
        )}

        <Button onClick={handleTest} disabled={!canExecute || loading} className="w-full" size="lg">
          {loading ? (
            "Testing..."
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Send Request
            </>
          )}
        </Button>

        {response && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Response</h4>
              <div className="flex items-center gap-2">
                <Badge
                  variant={response.status === 0 ? "destructive" : response.status < 300 ? "default" : "destructive"}
                  className="font-mono"
                >
                  {response.status === 0 ? "ERR" : response.status}
                </Badge>
                {response.statusText && <span className="text-sm text-muted-foreground">{response.statusText}</span>}
              </div>
            </div>
            {response.data ? (
              <CodeBlock
                code={typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2)}
                language="json"
              />
            ) : (
              <p className="text-sm text-muted-foreground">No response body</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
