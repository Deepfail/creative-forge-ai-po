import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { aiService } from '../lib/ai-service'
import { toast } from 'sonner'

export default function ScenarioTest() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState('')

  const testScenarioGeneration = async () => {
    setIsGenerating(true)
    setResult('')
    
    try {
      const promptText = `Create a simple romantic scenario between two characters:

Character 1: Sarah, 22, college student, shy personality
Character 2: The user

Generate a scenario with:
1. Title: A compelling title for the scenario
2. Setting: Where this takes place  
3. Mood: The overall tone/mood
4. Opening: The opening scene/situation

Make it engaging and tasteful.

Return as JSON:
{
  "title": "scenario title",
  "setting": "location description",
  "mood": "mood/tone", 
  "scenario": "opening scene description"
}`

      console.log('Testing scenario generation with prompt:', promptText.substring(0, 100) + '...')
      
      const response = await aiService.generateText(promptText, {
        temperature: 0.8,
        maxTokens: 1500
      })
      
      console.log('Raw response:', response)
      setResult(response)
      
      // Try to parse as JSON
      try {
        const parsed = JSON.parse(response)
        console.log('Successfully parsed JSON:', parsed)
        toast.success('Scenario generated successfully!')
      } catch (parseError) {
        console.log('Response was not valid JSON, but content generated')
        toast.success('Content generated (non-JSON format)')
      }
      
    } catch (error) {
      console.error('Scenario generation error:', error)
      setResult(`Error: ${error.message}`)
      toast.error('Failed to generate scenario')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Scenario Generation Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testScenarioGeneration}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? 'Generating...' : 'Test Scenario Generation'}
        </Button>
        
        {result && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="bg-muted p-4 rounded text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
              {result}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}