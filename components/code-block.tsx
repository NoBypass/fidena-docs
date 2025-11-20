"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"

interface CodeBlockProps {
  code: string
  language: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <Button
        size="sm"
        variant="ghost"
        className="absolute right-2 top-2 bg-white group-hover:opacity-100 transition-opacity"
        onClick={copyToClipboard}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-1" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
          </>
        )}
      </Button>
      <pre className="bg-code-bg text-foreground p-4 rounded-lg overflow-x-auto">
        <code className="text-sm font-mono text-white">{code}</code>
      </pre>
    </div>
  )
}
