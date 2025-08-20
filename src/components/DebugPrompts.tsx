import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useKV } from '@github/spark/hooks'
import { usePrompts, defaultPrompts } from '@/lib/prompts'
import { toast } from 'sonner'

export default function DebugPrompts() {
  const [rawPrompts, setRawPrompts] = useKV('chat-prompts', {})
  const { prompts, sortedPrompts, setPrompts } = usePrompts()

  useEffect(() => {
    console.log('DebugPrompts - Raw KV:', rawPrompts)
    console.log('DebugPrompts - usePrompts result:', prompts)
    console.log('DebugPrompts - Sorted:', sortedPrompts)
  }, [rawPrompts, prompts, sortedPrompts])

  const clearStorage = () => {
    setRawPrompts({})
    toast.success('Storage cleared')
  }

  const resetToDefaults = () => {
    setRawPrompts(defaultPrompts)
    toast.success('Reset to defaults')
  }

  const testDirectSet = () => {
    setPrompts(defaultPrompts)
    toast.success('Direct set called')
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Debug Prompts Storage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Button onClick={clearStorage} variant="outline">Clear Storage</Button>
            <Button onClick={resetToDefaults}>Reset to Defaults</Button>
            <Button onClick={testDirectSet} variant="secondary">Direct Set</Button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div><strong>Raw KV prompts:</strong> {Object.keys(rawPrompts || {}).length} items</div>
            <div><strong>usePrompts prompts:</strong> {Object.keys(prompts || {}).length} items</div>
            <div><strong>Sorted prompts:</strong> {sortedPrompts.length} items</div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <div><strong>Raw KV Keys:</strong> {Object.keys(rawPrompts || {}).join(', ')}</div>
            <div><strong>usePrompts Keys:</strong> {Object.keys(prompts || {}).join(', ')}</div>
          </div>
          
          <div className="bg-muted p-2 rounded text-xs">
            <div><strong>Raw KV Object:</strong></div>
            <pre>{JSON.stringify(rawPrompts, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}