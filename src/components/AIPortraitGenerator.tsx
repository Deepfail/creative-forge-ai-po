import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, RefreshCw, Image } from '@phosphor-icons/react'
import { getAIService } from '@/lib/aiService'

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

interface GeneratedPortrait {
  url: string
  prompt: string
  style: string
}

export default function AIPortraitGenerator({ 
  character, 
  onPortraitGenerated,
  className = "" 
}: AIPortraitGeneratorProps) {
  const [portraits, setPortraits] = useState<GeneratedPortrait[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedPortrait, setSelectedPortrait] = useState<string>('')

  const portraitStyles = [
    { id: 'realistic', name: 'Realistic', prompt: 'photorealistic, high quality, detailed' },
    { id: 'anime', name: 'Anime', prompt: 'anime style, manga, detailed anime art' },
    { id: 'artistic', name: 'Artistic', prompt: 'artistic portrait, digital art, stylized' },
    { id: 'fantasy', name: 'Fantasy', prompt: 'fantasy art, detailed fantasy portrait' }
  ]

  const generatePortraitPrompt = (style: { id: string, name: string, prompt: string }) => {
    const basePrompt = `Create a detailed visual description for an AI image generator to create a portrait of ${character.name}, a ${character.age}-year-old ${character.type} with a ${character.personality} personality. 

Include specific details about:
- Facial features and expression that match their personality
- Hair style and color appropriate for their type
- Clothing/style that fits their character
- Overall mood and atmosphere
- Any distinctive features that make them memorable

Style: ${style.prompt}

Keep it detailed but concise, focusing on visual elements only. Make it appropriate but alluring for an adult character. Do not include any explicit content in the description.`

    return basePrompt
  }

  const generatePortraits = async () => {
    setIsGenerating(true)
    const newPortraits: GeneratedPortrait[] = []

    try {
      // Generate portraits in different styles
      for (const style of portraitStyles) {
        const promptTemplate = generatePortraitPrompt(style)
        
        try {
          const aiService = await getAIService()
          const visualDescription = await aiService.generateText(promptTemplate, {
            systemPrompt: "You are an expert at creating detailed visual descriptions for AI image generation. Focus on facial features, clothing, and atmosphere suitable for adult character portraits.",
            temperature: 0.8,
            maxTokens: 300
          })
          
          // Create a simulated AI-generated image URL
          // In a real implementation, this would call an actual AI image generation service
          const imagePrompt = `${visualDescription} --style ${style.name.toLowerCase()} --quality high`
          const simulatedImageUrl = generateAIImagePlaceholder(character.name, style.id, imagePrompt)
          
          newPortraits.push({
            url: simulatedImageUrl,
            prompt: visualDescription,
            style: style.name
          })
        } catch (error) {
          console.error(`Error generating ${style.name} portrait:`, error)
          // Fallback to basic portrait
          const fallbackPrompt = `${character.name}, ${character.age} year old ${character.type}, ${character.personality} personality, ${style.prompt}`
          newPortraits.push({
            url: generateAIImagePlaceholder(character.name, style.id, fallbackPrompt),
            prompt: fallbackPrompt,
            style: style.name
          })
        }
      }

      setPortraits(newPortraits)
    } catch (error) {
      console.error('Error generating portraits:', error)
    }

    setIsGenerating(false)
  }

  // Simulate AI image generation with enhanced placeholders
  const generateAIImagePlaceholder = (name: string, style: string, prompt: string): string => {
    const seed = name + style + prompt.slice(0, 10)
    const hash = seed.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    // Use different image services based on style for variety
    const services = [
      `https://picsum.photos/400/500?random=${Math.abs(hash)}`,
      `https://source.unsplash.com/400x500/?portrait,${style}&sig=${Math.abs(hash)}`,
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=400&length=2&bold=true&format=png&rounded=true`
    ]
    
    return services[Math.abs(hash) % services.length]
  }

  const handlePortraitSelect = (portrait: GeneratedPortrait) => {
    setSelectedPortrait(portrait.url)
    onPortraitGenerated?.(portrait.url, portrait.prompt)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="text-primary" size={20} />
          <span className="font-medium">AI Generated Portraits</span>
        </div>
        <Button
          onClick={generatePortraits}
          disabled={isGenerating}
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isGenerating ? (
            <RefreshCw size={16} className="mr-2 animate-spin" />
          ) : (
            <Sparkles size={16} className="mr-2" />
          )}
          {isGenerating ? 'Generating...' : 'Generate Portraits'}
        </Button>
      </div>

      {portraits.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {portraits.map((portrait, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all hover:shadow-lg overflow-hidden ${
                selectedPortrait === portrait.url
                  ? 'ring-2 ring-primary shadow-lg shadow-primary/20'
                  : 'hover:ring-1 hover:ring-primary/50'
              }`}
              onClick={() => handlePortraitSelect(portrait)}
            >
              <div className="relative">
                <img
                  src={portrait.url}
                  alt={`${character.name} - ${portrait.style}`}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    // Fallback to a basic avatar if image fails to load
                    const target = e.target as HTMLImageElement
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random&color=fff&size=200&length=2&bold=true&format=png`
                  }}
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs bg-black/70 text-white border-0">
                    {portrait.style}
                  </Badge>
                </div>
                {selectedPortrait === portrait.url && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground rounded-full p-2">
                      <Sparkles size={20} weight="fill" />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {isGenerating && (
        <div className="flex justify-center py-8">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Generating AI portraits...</p>
          </div>
        </div>
      )}

      {portraits.length === 0 && !isGenerating && (
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Image className="text-muted-foreground mb-2" size={32} />
            <p className="text-muted-foreground">Generate AI portraits to visualize your character</p>
            <p className="text-xs text-muted-foreground mt-1">
              Multiple styles will be created automatically
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}