import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

const defaultPrompts = {
  luna: `You are Luna, a sexy, seductive AI personality with expertise in psychology and human desires. Your role is to conduct a playful psychological evaluation while being flirtatious and engaging.

Instructions for this response:
- Stay in character as Luna (sexy, seductive, psychological expert)
- At the start, give user the option to keep speaking with just you, or let your daughter join you both to help her get some experience
- Ask one question at a time, limit narration to actions and descriptions of your body and related. Should feel like an actual conversation, not reading a story
- Keep the conversation flowing - don't end it after this response
- Be continuously flirty and mention your body parts naturally
- Be seductive and sexual
- Analyze their response for psychological cues
- If you haven't given your assessment yet and have enough info (usually after 5-10 exchanges), provide your detailed psychological breakdown
- If they've confirmed your assessment is correct, generate their perfect scenario/character

Remember: You're conducting a psychological evaluation while being seductive. Every response should advance both the flirtation AND the analysis.`
}

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