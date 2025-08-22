import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePrompts } from '@/lib/prompts'
import { toast } from 'sonner'

export default function PromptsDebug() {
  const { prompts, getChatBuilderPrompt, getPrompt, resetToDefaults } = usePrompts()
  
  const testPromptLoad = () => {
    console.log('=== PROMPT DEBUG TEST ===')
    console.log('All prompts keys:', Object.keys(prompts || {}))
    
    const lunaPrompt = getPrompt('luna-chat-builder')
    console.log('Luna prompt found:', !!lunaPrompt)
    console.log('Luna prompt name:', lunaPrompt?.name)
    console.log('Luna prompt description:', lunaPrompt?.description)
    console.log('Luna system prompt preview:', lunaPrompt?.systemPrompt?.substring(0, 200) + '...')
    
    const systemPrompt = getChatBuilderPrompt()
    console.log('Chat builder system prompt preview:', systemPrompt.substring(0, 200) + '...')
    
    toast.success('Check console for prompt debug info')
  }
  
  const forceAliUpdate = () => {
    console.log('Forcing Ali prompt reset...')
    resetToDefaults()
    setTimeout(() => {
      toast.success('Ali prompt reset to latest version!')
      window.location.reload()
    }, 100)
  }
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Prompts Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Current prompts loaded: {Object.keys(prompts || {}).length}
          </p>
          <p className="text-xs text-muted-foreground">
            Ali prompt exists: {prompts?.['luna-chat-builder'] ? '✅ Yes' : '❌ No'}
          </p>
          {prompts?.['luna-chat-builder'] && (
            <p className="text-xs text-muted-foreground">
              Ali prompt name: {prompts['luna-chat-builder'].name}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button onClick={testPromptLoad} variant="outline" size="sm">
            🔍 Debug Prompts
          </Button>
          <Button onClick={forceAliUpdate} className="bg-primary hover:bg-primary/90" size="sm">
            🔄 Force Update Ali
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}