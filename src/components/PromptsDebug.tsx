import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePrompts, defaultPrompts } from '@/lib/prompts'

export default function PromptsDebug() {
  const { prompts, sortedPrompts, setPrompts, forceClear } = usePrompts()

  const showDebugInfo = () => {
    console.log('=== PROMPTS DEBUG ===')
    console.log('Current prompts:', prompts)
    console.log('Sorted prompts:', sortedPrompts)
    console.log('Default prompts:', defaultPrompts)
    console.log('Number of prompts:', Object.keys(prompts || {}).length)
    console.log('===================')
  }

  const forceLoadDefaults = () => {
    console.log('Force loading default prompts...')
    setPrompts(defaultPrompts)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompts Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>Prompts loaded: {prompts ? 'Yes' : 'No'}</div>
          <div>Number of prompts: {Object.keys(prompts || {}).length}</div>
          <div>Default prompts available: {Object.keys(defaultPrompts).length}</div>
          <div>Sorted prompts: {sortedPrompts.length}</div>
        </div>
        
        <div className="space-y-2">
          <Button onClick={showDebugInfo} size="sm">
            Log Debug Info
          </Button>
          <Button onClick={forceLoadDefaults} size="sm" variant="outline">
            Force Load Defaults
          </Button>
          <Button onClick={forceClear} size="sm" variant="destructive">
            Clear All Prompts
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <div>Available prompt IDs:</div>
          <div>{Object.keys(prompts || {}).join(', ') || 'None'}</div>
        </div>
      </CardContent>
    </Card>
  )
}