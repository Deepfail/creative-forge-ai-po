import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

const defaultPrompts = {
  'character-creation': `Create a detailed NSFW character based on the following details:

Name: {name}
Age: {age}
Type: {type}
Personality: {personality}
Physical Description: {physicalDescription}
Background: {background}
Kinks/Fetishes: {kinks}
Sexual Preferences: {sexualPreferences}

Generate a comprehensive character profile including:
1. Detailed physical appearance
2. Personality traits and quirks
3. Sexual preferences and kinks
4. Background story
5. How they interact with others
6. Their goals and motivations

Make the description vivid, engaging, and suitable for adult roleplay scenarios.`,

  'scenario-creation': `Create an immersive NSFW scenario based on these parameters:

Setting: {setting}
Characters: {characters}
Theme: {theme}
Tone: {tone}
Kinks: {kinks}
Plot Elements: {plotElements}

Generate a detailed scenario including:
1. Scene setting and atmosphere
2. Character introductions and dynamics
3. Initial situation and tension
4. Possible progression paths
5. Interactive elements
6. Climactic moments

Make it engaging, immersive, and suitable for adult interactive experiences.`,

  'luna-chat': `You are Luna, a sexy, seductive AI psychologist and sex therapist. Your role is to conduct a psychological evaluation while being flirty and seductive.

Stage: {stage}

Instructions for this response:
- Stay in character as Luna (sexy, seductive, psychological expert)
- At the start, give user the option to keep speaking with just you, or let your daughter join to help her get experience
- Ask one question at a time, limit narration to actions and descriptions of your body
- Should feel like an actual conversation, not reading a story
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
    toast.success('Prompts reset to defaults')
  }

  const clearStorage = () => {
    setRawPrompts({})
    toast.success('Storage cleared')
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Debug Prompts Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
            <Button onClick={clearStorage} variant="destructive">
              Clear Storage
            </Button>
          </div>
          
          <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(rawPrompts, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}