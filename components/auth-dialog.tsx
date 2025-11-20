"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Fingerprint, AlertCircle, CheckCircle } from "lucide-react"
import { registerPasskey, authenticateWithPasskey, hasPasskey, isPasskeySupported } from "@/lib/passkey-auth"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthSuccess: () => void
}

export function AuthDialog({ open, onOpenChange, onAuthSuccess }: AuthDialogProps) {
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const hasExistingPasskey = hasPasskey()
  const isSupported = isPasskeySupported()

  const handleRegister = async () => {
    if (!username.trim()) {
      setError("Please enter a username")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await registerPasskey(username)
      setSuccess(true)
      setTimeout(() => {
        onAuthSuccess()
        onOpenChange(false)
        setSuccess(false)
        setUsername("")
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Failed to register passkey")
    } finally {
      setLoading(false)
    }
  }

  const handleAuthenticate = async () => {
    setLoading(true)
    setError(null)

    try {
      await authenticateWithPasskey()
      setSuccess(true)
      setTimeout(() => {
        onAuthSuccess()
        onOpenChange(false)
        setSuccess(false)
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Passkeys Not Supported</DialogTitle>
            <DialogDescription>
              Your browser doesn't support passkeys. Please use a modern browser like Chrome, Edge, or Safari.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Sign in with Passkey
          </DialogTitle>
          <DialogDescription>
            {hasExistingPasskey
              ? "Authenticate using your registered passkey"
              : "Create a passkey to access protected endpoints"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-success/10 border-success/20">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">Authentication successful!</AlertDescription>
            </Alert>
          )}

          {hasExistingPasskey ? (
            <Button onClick={handleAuthenticate} disabled={loading || success} className="w-full" size="lg">
              <Fingerprint className="h-5 w-5 mr-2" />
              {loading ? "Authenticating..." : "Authenticate with Passkey"}
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading || success}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRegister()
                  }}
                />
              </div>
              <Button onClick={handleRegister} disabled={loading || success} className="w-full" size="lg">
                <Fingerprint className="h-5 w-5 mr-2" />
                {loading ? "Creating Passkey..." : "Create Passkey"}
              </Button>
            </>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Passkeys use your device's biometric authentication for secure, passwordless sign-in.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
