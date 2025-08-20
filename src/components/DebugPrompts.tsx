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

Make it engaging, immersive, and suitable for adult interactive experiences.`
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