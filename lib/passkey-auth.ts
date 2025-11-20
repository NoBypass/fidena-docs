"use client"

// Passkey authentication utilities using WebAuthn API

export interface PasskeyCredential {
  id: string
  publicKey: string
  username: string
}

// Check if WebAuthn is supported
export function isPasskeySupported(): boolean {
  return (
    typeof window !== "undefined" &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === "function"
  )
}

// Register a new passkey
export async function registerPasskey(username: string): Promise<boolean> {
  if (!isPasskeySupported()) {
    throw new Error("Passkeys are not supported in this browser")
  }

  try {
    // Generate challenge
    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)

    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: "API Documentation",
        id: typeof window !== "undefined" ? window.location.hostname : "localhost",
      },
      user: {
        id: new TextEncoder().encode(username),
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" }, // ES256
        { alg: -257, type: "public-key" }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        requireResidentKey: true,
        residentKey: "required",
        userVerification: "required",
      },
      timeout: 60000,
      attestation: "none",
    }

    const credential = (await navigator.credentials.create({
      publicKey: publicKeyOptions,
    })) as PublicKeyCredential

    if (!credential) {
      throw new Error("Failed to create credential")
    }

    // Store credential info in localStorage (in production, send to server)
    const credentialData: PasskeyCredential = {
      id: credential.id,
      publicKey: arrayBufferToBase64(credential.rawId),
      username,
    }

    localStorage.setItem("passkey_credential", JSON.stringify(credentialData))
    localStorage.setItem("passkey_authenticated", "true")

    return true
  } catch (error) {
    console.error("Passkey registration failed:", error)
    throw error
  }
}

// Authenticate with existing passkey
export async function authenticateWithPasskey(): Promise<boolean> {
  if (!isPasskeySupported()) {
    throw new Error("Passkeys are not supported in this browser")
  }

  try {
    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)

    const publicKeyOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      rpId: typeof window !== "undefined" ? window.location.hostname : "localhost",
      userVerification: "required",
    }

    const credential = (await navigator.credentials.get({
      publicKey: publicKeyOptions,
    })) as PublicKeyCredential

    if (!credential) {
      throw new Error("Authentication failed")
    }

    localStorage.setItem("passkey_authenticated", "true")
    return true
  } catch (error) {
    console.error("Passkey authentication failed:", error)
    throw error
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("passkey_authenticated") === "true"
}

// Sign out
export function signOut(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("passkey_authenticated")
}

// Check if passkey exists
export function hasPasskey(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("passkey_credential") !== null
}

// Utility function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
