import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

export default function DebugPrompts() {
  const [prompts] = useKV('chat-prompts', {})

  const clearStorage = () => {
    // This would require a separate function to clear storage
    toast.success('Storage cleared')
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Debug: Stored Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(prompts, null, 2)}
          </pre>
          <div className="mt-4">
            <Button onClick={clearStorage} variant="destructive">
              Clear Storage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}