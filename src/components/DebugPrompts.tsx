import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

const defaultPrompts = {}

export default function DebugPrompts() {
  const [rawPrompts, setRawPrompts] = useKV('chat-prompts', defaultPrompts)

  const resetToDefaults = () => {
    setRawPrompts(defaultPrompts)
    toast.success('Reset to defaults')
  }

  const clearStorage = () => {
    setRawPrompts({})
    toast.success('Storage cleared')
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Debug: Prompts Manager</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={resetToDefaults} variant="outline">
              Reset to Defaults
            </Button>
            <Button onClick={clearStorage} variant="destructive">
              Clear Storage
            </Button>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Current Raw Prompts:</h3>
            <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(rawPrompts, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}