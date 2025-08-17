import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, RefreshCw, Image, Warning } from '@phosphor-icons/react'
import { aiService } from '@/lib/ai-service'
import { toast } from 'sonner'

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
  const [error, setError] = useState<string>('')
  // No longer need API config for built-in Venice AI

  const generatePortrait = async () => {
    setIsGenerating(true)
    setError('')
    
    try {
      const promptText = `Beautiful portrait of ${character.name}, a ${character.age}-year-old ${character.type} with ${character.personality} personality. ${character.physicalDescription || 'Attractive and appealing appearance'}, detailed facial features, photorealistic, high quality`
      
      console.log('Starting image generation with prompt:', promptText)
      
      toast.info('Generating AI portrait...')
      
      const imageUrl = await aiService.generateImage(promptText, {
        width: 400,
        height: 500,
        style: 'realistic portrait, detailed facial features, professional photography, high quality'
      })
      
      console.log('Generated image URL:', imageUrl)
      
      setGeneratedImage(imageUrl)
      setImagePrompt(promptText)
      
      if (onPortraitGenerated) {
        onPortraitGenerated(imageUrl, promptText)
      }
      
      // Check if it's a placeholder or real AI generated image
      if (imageUrl.startsWith('data:')) {
        toast.info('Venice AI unavailable - using artistic placeholder')
      } else {
        toast.success('AI portrait generated successfully!')
      }
    } catch (error) {
      console.error('Error generating portrait:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate portrait'
      setError(errorMessage)
      toast.error(`Failed to generate portrait: ${errorMessage}`)
    }
    
    setIsGenerating(false)
  }

  const isPlaceholder = generatedImage.startsWith('data:')

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
      
      {error && (
        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive flex items-center gap-2">
          <Warning size={12} />
          {error}
        </div>
      )}
      
      {generatedImage && (
        <div className="mt-2">
          <img 
            src={generatedImage} 
            alt={`AI generated portrait of ${character.name}`}
            className="w-full rounded-lg border border-primary/20"
            onError={() => setError('Failed to load generated image')}
          />
          <div className="flex justify-between items-center mt-1">
            <Badge 
              variant={isPlaceholder ? "outline" : "secondary"} 
              className={`text-xs ${isPlaceholder ? 'border-accent text-accent' : ''}`}
            >
              {isPlaceholder ? 'Artistic Portrait' : 'AI Generated'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={generatePortrait}
              className="text-xs h-6 px-2"
            >
              <RefreshCw size={10} className="mr-1" />
              Regenerate
            </Button>
          </div>
          {imagePrompt && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {imagePrompt}
            </p>
          )}
        </div>
      )}
    </div>
  )
}