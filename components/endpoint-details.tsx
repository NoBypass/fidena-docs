"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

interface Response {
  description: string
  body: any
}

interface Endpoint {
  method: string
  path: string
  name: string
  description: string
  requiresAuth: boolean
  parameters: Parameter[]
  requestBody?: RequestBody
  responses: Record<string, Response>
}

interface EndpointDetailsProps {
  endpoint: Endpoint
  isAuthenticated: boolean
}

const methodColors: Record<string, string> = {
  GET: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  POST: "bg-green-500/10 text-green-500 border-green-500/20",
  PUT: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
  PATCH: "bg-purple-500/10 text-purple-500 border-purple-500/20",
}

const statusColors: Record<string, string> = {
  "200": "text-success",
  "201": "text-success",
  "204": "text-success",
  "400": "text-warning",
  "401": "text-destructive",
  "404": "text-destructive",
  "409": "text-warning",
  "500": "text-destructive",
}

export function EndpointDetails({ endpoint, isAuthenticated }: EndpointDetailsProps) {
  const pathParams = endpoint.parameters.filter((p) => p.in === "path")
  const queryParams = endpoint.parameters.filter((p) => p.in === "query")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className={`text-sm font-mono font-bold px-3 py-1 ${methodColors[endpoint.method]}`}>
            {endpoint.method}
          </Badge>
          <code className="text-lg font-mono font-semibold">{endpoint.path}</code>
          {endpoint.requiresAuth && (
            <div className="flex items-center gap-1.5 text-warning">
              <Lock className="h-4 w-4" />
              <span className="text-sm font-medium">Auth Required</span>
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold mb-2">{endpoint.name}</h1>
        <p className="text-muted-foreground text-lg">{endpoint.description}</p>
      </div>

      {/* Auth Warning */}
      {endpoint.requiresAuth && !isAuthenticated && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This endpoint requires authentication. Sign in with a passkey to test this endpoint.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="parameters" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="request">Request</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
        </TabsList>

        {/* Parameters Tab */}
        <TabsContent value="parameters" className="space-y-4">
          {pathParams.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Path Parameters</CardTitle>
                <CardDescription>Parameters included in the URL path</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pathParams.map((param) => (
                    <div key={param.name} className="border-l-2 border-primary/50 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="font-mono font-semibold">{param.name}</code>
                        <Badge variant="secondary" className="text-xs">
                          {param.type}
                        </Badge>
                        {param.required && (
                          <Badge variant="destructive" className="text-xs">
                            required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{param.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {queryParams.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Query Parameters</CardTitle>
                <CardDescription>Optional parameters in the query string</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {queryParams.map((param) => (
                    <div key={param.name} className="border-l-2 border-primary/50 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="font-mono font-semibold">{param.name}</code>
                        <Badge variant="secondary" className="text-xs">
                          {param.type}
                        </Badge>
                        {param.required && (
                          <Badge variant="destructive" className="text-xs">
                            required
                          </Badge>
                        )}
                        {param.default !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            default: {JSON.stringify(param.default)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{param.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {pathParams.length === 0 && queryParams.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No parameters required for this endpoint
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Request Tab */}
        <TabsContent value="request" className="space-y-4">
          {endpoint.requestBody ? (
            <Card>
              <CardHeader>
                <CardTitle>Request Body</CardTitle>
                <CardDescription>
                  {endpoint.requestBody.required ? "Required" : "Optional"} request body
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(endpoint.requestBody.content).map(([key, field]) => (
                  <div key={key} className="border-l-2 border-primary/50 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="font-mono font-semibold">{key}</code>
                      <Badge variant="secondary" className="text-xs">
                        {field.type}
                      </Badge>
                      {field.required && (
                        <Badge variant="destructive" className="text-xs">
                          required
                        </Badge>
                      )}
                      {field.default !== undefined && (
                        <span className="text-xs text-muted-foreground">default: {JSON.stringify(field.default)}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{field.description}</p>
                  </div>
                ))}

                <div className="mt-6">
                  <h4 className="text-sm font-semibold mb-2">Example Request</h4>
                  <CodeBlock
                    code={JSON.stringify(
                      Object.fromEntries(
                        Object.entries(endpoint.requestBody.content).map(([key, field]) => [
                          key,
                          field.default || `<${field.type}>`,
                        ]),
                      ),
                      null,
                      2,
                    )}
                    language="json"
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No request body required for this endpoint
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Responses Tab */}
        <TabsContent value="responses" className="space-y-4">
          {Object.entries(endpoint.responses).map(([status, response]) => (
            <Card key={status}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CardTitle className={`font-mono ${statusColors[status] || ""}`}>{status}</CardTitle>
                  <CardDescription>{response.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {response.body ? (
                  <CodeBlock code={JSON.stringify(response.body, null, 2)} language="json" />
                ) : (
                  <p className="text-sm text-muted-foreground">No response body</p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
