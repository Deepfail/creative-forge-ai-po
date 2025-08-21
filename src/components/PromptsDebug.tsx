import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePrompts } from '../hooks/usePrompts'
import { defaultPrompts } from '../data/chat-prompts'

export default function PromptsDebug() {
  const { 
    prompts, 
    loadPrompts, 
    deletePrompt, 
    resetToDefaults: forceLoadDefaults 
  } = usePrompts()
  
  const sortedPrompts = Object.entries(prompts || {}).sort(([a], [b]) => a.localeCompare(b))
  
  console.log('=== PROMPTS DEBUG INFO ===')
  console.log('Number of prompts:', Object.keys(prompts || {}).length)
  console.log('Default prompts available:', Object.keys(defaultPrompts).length)
  console.log('Current prompts:', prompts)
  console.log('Default prompts:', defaultPrompts)

  const handleForceDefaults = () => {
    console.log('Forcing default prompts reload...')
    forceLoadDefaults()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Prompts Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Current Prompts ({Object.keys(prompts || {}).length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sortedPrompts.map(([key, prompt]) => (
                  <div key={key} className="bg-muted p-2 rounded text-sm">
                    <div className="font-medium">{key}</div>
                    <div className="text-muted-foreground truncate">
                      {typeof prompt === 'string' ? prompt.substring(0, 100) + '...' : JSON.stringify(prompt).substring(0, 100) + '...'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Default Prompts ({Object.keys(defaultPrompts).length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(defaultPrompts).map(([key, prompt]) => (
                  <div key={key} className="bg-muted p-2 rounded text-sm">
                    <div className="font-medium">{key}</div>
                    <div className="text-muted-foreground truncate">
                      {prompt.substring(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleForceDefaults} variant="outline">
              Force Load Defaults
            </Button>
            <Button onClick={() => loadPrompts()} variant="outline">
              Reload Prompts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}