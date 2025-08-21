import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePrompts, defaultPrompts } from '@/lib/prompts'

export default function PromptsDebug() {
  const { prompts, resetToDefaults } = usePrompts()
  
  const sortedPrompts = Object.entries(prompts || {}).sort(([a], [b]) => a.localeCompare(b))
  
  const handleLogDebug = () => {
    console.log('=== PROMPTS DEBUG INFO ===')
    console.log('Current prompts:', prompts)
    console.log('Number of prompts:', Object.keys(prompts || {}).length)
    console.log('Default prompts available:', Object.keys(defaultPrompts).length)
    console.log('Default prompts:', defaultPrompts)
    console.log('========================')
  }

  const handleForceDefaults = () => {
    console.log('Force loading default prompts...')
    resetToDefaults()
    console.log('Default prompts loaded')
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">Prompts Debug Console</CardTitle>
          <div className="flex gap-4">
            <Button onClick={handleLogDebug} size="sm" variant="outline">
              Log Debug Info
            </Button>
            <Button onClick={handleForceDefaults} size="sm" variant="outline">
              Force Load Defaults
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <h3 className="text-lg font-semibold mb-4">Available Prompts ({sortedPrompts.length})</h3>
            <div className="space-y-2">
              {sortedPrompts.map(([key, prompt]) => (
                <div key={key} className="p-3 bg-muted rounded-md">
                  <div className="font-medium text-sm">{key}</div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {typeof prompt === 'string' ? prompt.substring(0, 100) + '...' : JSON.stringify(prompt).substring(0, 100) + '...'}
                  </div>
                </div>
              ))}
              {sortedPrompts.length === 0 && (
                <div className="text-muted-foreground text-center py-8">
                  No prompts found. Try clicking "Force Load Defaults" above.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}