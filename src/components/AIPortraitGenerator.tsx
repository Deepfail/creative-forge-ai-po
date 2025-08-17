import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, RefreshCw, Image } from '@phosphor-icons/react'
import { aiService } from '@/lib/ai-service'

interface AIPortraitGeneratorProps {
  character: {
    name: string
    age: number
    type: string
    personality: string
    physicalDescription?: string
    style?: string
  }
  onPortraitGenerated?: (imageUrl: string, prompt: string) => void
  className?: string
}

export default function AIPortraitGenerator({ 
  character, 
  onPortraitGenerated,
  className = "" 
}: AIPortraitGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string>('')
  const [imagePrompt, setImagePrompt] = useState<string>('')

  const generatePortrait = async () => {
    setIsGenerating(true)
    
    try {
      const promptText = `Portrait of ${character.name}, a ${character.age}-year-old ${character.type} with ${character.personality} personality. ${character.physicalDescription || 'Attractive and appealing appearance'}`
      
      const imageUrl = await aiService.generateImage(promptText, {
        width: 300,
        height: 400,
        style: 'realistic portrait, detailed, high quality'
      })
      
      setGeneratedImage(imageUrl)
      setImagePrompt(promptText)
      
      if (onPortraitGenerated) {
        onPortraitGenerated(imageUrl, promptText)
      }
    } catch (error) {
      console.error('Error generating portrait:', error)
    }
    
    setIsGenerating(false)
  }

  return (
    <div className={className}>
      <Button
        onClick={generatePortrait}
        disabled={isGenerating}
        variant="outline"
        size="sm"
        className="w-full border-primary/50 text-primary hover:bg-primary/10"
      >
        {isGenerating ? (
          <>
            <RefreshCw size={14} className="mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={14} className="mr-2" />
            Generate AI Portrait
          </>
        )}
      </Button>
      
      {generatedImage && (
        <div className="mt-2">
          <img 
            src={generatedImage} 
            alt={`AI generated portrait of ${character.name}`}
            className="w-full rounded-lg border border-primary/20"
          />
          <Badge variant="secondary" className="mt-1 text-xs">
            AI Generated
          </Badge>
        </div>
      )}
    </div>
  )
}