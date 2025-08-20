import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shuffle, Sparkle, Heart, Download, Crown, ArrowLeft } from '@phosphor-icons/react'
import AIPortraitGenerator from './AIPortraitGenerator'
import ExportDialog from './ExportDialog'
import { aiService } from '@/lib/ai-service'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import type { SavedGirl } from './Harem'

interface GeneratedGirl {
  id: string
  name: string
  age: number
  type: string
  personality: string
  summary: string
  imageUrl: string
  aiPortraitPrompt?: string
  physicalDescription?: string
}

interface GenerateGirlsProps {
  onBack: () => void
}

const girlTypes = [
  'Cheerleader', 'Emo Girl', 'Class Slut', 'Bookworm', 'MILF', 'Step-Sister', 
  'Mean Girl', 'Goth Girl', 'Popular Girl', 'Shy Nerd', 'Bad Girl', 'Teacher\'s Pet',
  'Party Girl', 'College Freshman', 'Sorority Sister', 'Punk Girl'
]

const personalities = [
  'Shy and innocent', 'Loud and obnoxious', 'Unconfident', 'Sad and vulnerable',
  'Wild and adventurous', 'Sweet and caring', 'Bratty and demanding', 'Mysterious and alluring',
  'Confident and dominant', 'Playful and teasing', 'Serious and studious', 'Rebellious and free',
  'Flirty and seductive', 'Anxious and needy', 'Bold and fearless', 'Gentle and submissive'
]

const femaleNames = [
  'Sophia', 'Emma', 'Olivia', 'Ava', 'Isabella', 'Mia', 'Charlotte', 'Amelia',
  'Harper', 'Evelyn', 'Abigail', 'Emily', 'Elizabeth', 'Sofia', 'Avery', 'Ella',
  'Madison', 'Scarlett', 'Victoria', 'Aria', 'Grace', 'Chloe', 'Camila', 'Penelope',
  'Riley', 'Layla', 'Lillian', 'Nora', 'Zoe', 'Mila', 'Aubrey', 'Hannah', 'Lily',
  'Addison', 'Eleanor', 'Natalie', 'Maya', 'Savannah', 'Brooklyn', 'Leah', 'Zara',
  'Stella', 'Hazel', 'Ellie', 'Paisley', 'Audrey', 'Skylar', 'Violet', 'Claire'
]

// Generate portrait using built-in Venice AI image generation
const generatePlaceholderImage = async (name: string, type: string, physicalDescription?: string): Promise<string> => {
  console.log('=== GENERATING PORTRAIT FOR:', name, type, '===')
  console.log('Physical description:', physicalDescription)
  
  // Create a detailed prompt for Venice AI
  const characterTraits = []
  if (type.toLowerCase().includes('cheerleader')) characterTraits.push('athletic, energetic')
  if (type.toLowerCase().includes('goth')) characterTraits.push('dark makeup, alternative style')
  if (type.toLowerCase().includes('nerd')) characterTraits.push('intellectual appearance, glasses')
  if (type.toLowerCase().includes('milf')) characterTraits.push('mature, sophisticated')
  if (type.toLowerCase().includes('emo')) characterTraits.push('alternative style, emotional')
  
  const basePrompt = `Portrait of ${name}, a beautiful ${type}`
  const detailedPrompt = physicalDescription 
    ? `${basePrompt}, ${physicalDescription}` 
    : `${basePrompt}, ${characterTraits.join(', ') || 'attractive young woman'}`
  
  console.log('Full prompt for AI generation:', detailedPrompt)
  
  try {
    const result = await aiService.generateImage(detailedPrompt, { 
      width: 300, 
      height: 400, 
      style: 'realistic portrait, detailed, high quality, professional photography' 
    })
    
    console.log('=== PORTRAIT GENERATION RESULT ===')
    console.log('Type:', typeof result)
    console.log('Length:', result.length)
    console.log('Starts with data:', result.startsWith('data:'))
    console.log('Starts with http:', result.startsWith('http'))
    console.log('Is SVG placeholder:', result.includes('data:image/svg'))
    console.log('Preview:', result.substring(0, 100))
    
    return result
  } catch (error) {
    console.error('Portrait generation failed:', error)
    // Return a simple fallback
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#2a2a2a"/>
        <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="14">${name}</text>
        <text x="50%" y="60%" text-anchor="middle" fill="#888" font-size="12">${type}</text>
      </svg>
    `)
  }
}

const generateRandomGirl = async (): Promise<GeneratedGirl> => {
  const name = femaleNames[Math.floor(Math.random() * femaleNames.length)]
  const age = Math.floor(Math.random() * 13) + 18 // 18-30
  const type = girlTypes[Math.floor(Math.random() * girlTypes.length)]
  const personality = personalities[Math.floor(Math.random() * personalities.length)]
  
  // Generate AI summary and physical description using Venice AI
  const summaryPrompt = `Create a brief, engaging character summary for an adult character named ${name}, age ${age}, who is a ${type} with a ${personality} personality. Make it intriguing and hint at her appeal and backstory. Keep it under 50 words and make it slightly suggestive but tasteful.`
  
  const physicalPrompt = `Describe the physical appearance of ${name}, a ${age}-year-old ${type} with a ${personality} personality. Include details about her hair, eyes, body type, style, and any distinctive features. Keep it detailed but appropriate, focusing on what makes her attractive and memorable. About 2-3 sentences.`
  
  let summary = ''
  let physicalDescription = ''
  let imageUrl = ''
  
  try {
    // Generate text descriptions
    summary = await aiService.generateText(summaryPrompt, {
      systemPrompt: "You are an expert at creating engaging character descriptions for adult content. Be creative and slightly suggestive while remaining tasteful.",
      temperature: 0.8,
      maxTokens: 100
    })
    physicalDescription = await aiService.generateText(physicalPrompt, {
      systemPrompt: "You are an expert at creating detailed physical descriptions for adult characters. Focus on attractive, memorable features.",
      temperature: 0.8,
      maxTokens: 150
    })
    
    // Generate image
    imageUrl = await generatePlaceholderImage(name, type, physicalDescription)
  } catch (error) {
    console.warn('AI generation failed, using fallback:', error)
    // Fallback to predefined summaries if AI fails
    const fallbackSummaries = [
      `${name} is a ${age}-year-old ${type.toLowerCase()} who captivates everyone with her ${personality.toLowerCase()} nature. She has secrets behind those eyes that make people want to know more.`,
      `Meet ${name}, a ${type.toLowerCase()} with a ${personality.toLowerCase()} personality. At ${age}, she's learned exactly what she wants and how to get it with just a smile.`,
      `${name} is the kind of ${type.toLowerCase()} who turns heads wherever she goes. Her ${personality.toLowerCase()} demeanor hides depths waiting to be explored by someone special.`,
      `This ${age}-year-old ${type.toLowerCase()} has a magnetic presence. ${name}'s ${personality.toLowerCase()} personality makes every conversation feel intimate and exciting.`
    ]
    summary = fallbackSummaries[Math.floor(Math.random() * fallbackSummaries.length)]
    physicalDescription = `${name} has an alluring presence that perfectly matches her ${personality.toLowerCase()} personality. Her style reflects her ${type.toLowerCase()} nature, with features that are both striking and memorable.`
    imageUrl = await generatePlaceholderImage(name, type, physicalDescription)
  }
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    age,
    type,
    personality,
    summary: summary.replace(/"/g, ''), // Clean up any quotes
    physicalDescription: physicalDescription.replace(/"/g, ''),
    imageUrl
  }
}

export default function GenerateGirls({ onBack }: GenerateGirlsProps) {
  const [girls, setGirls] = useState<GeneratedGirl[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedGirl, setSelectedGirl] = useState<GeneratedGirl | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [savedGirls, setSavedGirls] = useKV<SavedGirl[]>('saved-girls', [])
  const [apiConfig] = useKV<any>('api-config', { apiKey: '', textModel: 'default', imageModel: 'flux-1.1-pro' })

  const generateNewGirls = async () => {
    setIsGenerating(true)
    
    try {
      // Generate girls with AI summaries and descriptions
      const newGirls = await Promise.all(
        Array.from({ length: 4 }, () => generateRandomGirl())
      )
      setGirls(newGirls)
    } catch (error) {
      console.error('Error generating girls:', error)
      // Fallback to simple generation without AI
      const fallbackGirls = await Promise.all(
        Array.from({ length: 4 }, async () => {
          const name = femaleNames[Math.floor(Math.random() * femaleNames.length)]
          const age = Math.floor(Math.random() * 13) + 18
          const type = girlTypes[Math.floor(Math.random() * girlTypes.length)]
          const personality = personalities[Math.floor(Math.random() * personalities.length)]
          
          return {
            id: Math.random().toString(36).substr(2, 9),
            name,
            age,
            type,
            personality,
            summary: `${name} is a captivating ${age}-year-old ${type.toLowerCase()} with a ${personality.toLowerCase()} personality that draws people in.`,
            physicalDescription: `${name} has an alluring presence that perfectly matches her ${personality.toLowerCase()} personality.`,
            imageUrl: await generatePlaceholderImage(name, type)
          }
        })
      )
      setGirls(fallbackGirls)
    }
    
    setIsGenerating(false)
  }

  const handlePortraitGenerated = (girlId: string, imageUrl: string, prompt: string) => {
    setGirls(prev => prev.map(girl => 
      girl.id === girlId 
        ? { ...girl, imageUrl, aiPortraitPrompt: prompt }
        : girl
    ))
  }

  const saveToHarem = (girl: GeneratedGirl) => {
    const savedGirl: SavedGirl = {
      id: girl.id,
      name: girl.name,
      age: girl.age,
      type: girl.type,
      personality: girl.personality,
      summary: girl.summary,
      image: girl.imageUrl,
      createdAt: Date.now(),
      roles: [],
      tags: [],
      tasks: [],
      favorited: false,
      rating: 0
    }
    
    setSavedGirls(current => {
      const currentGirls = current || []
      const exists = currentGirls.some(g => g.id === girl.id)
      if (exists) {
        toast.error('Girl already in harem')
        return currentGirls
      }
      toast.success(`${girl.name} added to harem!`)
      return [...currentGirls, savedGirl]
    })
  }

  const isInHarem = (girlId: string) => {
    return savedGirls?.some(g => g.id === girlId) || false
  }

  const formatCharacterForExport = (girl: GeneratedGirl): string => {
    return `# ${girl.name}

**Age:** ${girl.age}
**Type:** ${girl.type}
**Personality:** ${girl.personality}

## Description
${girl.summary}

## Physical Appearance
${girl.physicalDescription || 'A captivating presence that matches her personality perfectly.'}

## Character Details
- **Background:** ${girl.type} with ${girl.personality.toLowerCase()} traits
- **Age:** ${girl.age} years old
- **Appeal:** ${girl.summary}

${girl.aiPortraitPrompt ? `## AI Portrait Prompt
${girl.aiPortraitPrompt}` : ''}

## Roleplay Notes
This character was designed for adult interactive experiences and can be adapted for various scenarios and storylines.

---
*Generated by AI Creative Generator*`
  }

  const handleExportCharacter = (girl: GeneratedGirl) => {
    setSelectedGirl(girl)
    setExportDialogOpen(true)
  }

  useEffect(() => {
    generateNewGirls()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="border-primary/30 hover:bg-primary/10"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Heart className="text-secondary" size={32} weight="fill" />
            <h1 className="text-3xl font-bold text-foreground">Generate Girls</h1>
          </div>
          <div className="ml-auto flex gap-2">
            <Button 
              onClick={async () => {
                console.log('=== TESTING SINGLE IMAGE GENERATION ===')
                const testPrompt = 'Beautiful blonde cheerleader named Jessica, athletic build, blue eyes'
                try {
                  const result = await aiService.generateImage(testPrompt, { 
                    width: 300, 
                    height: 400, 
                    style: 'realistic portrait, detailed, high quality' 
                  })
                  console.log('Test generation completed. Result type:', typeof result)
                  console.log('Result length:', result.length)
                  console.log('Is SVG:', result.includes('svg'))
                  console.log('Preview:', result.substring(0, 200))
                  toast.success('Test image generated! Check console for details.')
                } catch (error) {
                  console.error('Test generation failed:', error)
                  toast.error('Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
                }
              }}
              variant="outline"
              size="sm"
              className="border-accent/30 hover:bg-accent/10"
            >
              <Sparkle size={16} className="mr-2" />
              Test AI Image
            </Button>
            <Button 
              onClick={generateNewGirls}
              disabled={isGenerating}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Shuffle size={20} className="mr-2" />
              {isGenerating ? 'Generating...' : 'Generate New'}
            </Button>
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover randomly generated characters with unique personalities and traits. 
            Each girl is created with detailed characteristics perfect for your scenarios.
          </p>
          
          {/* Debug Info */}
          <Card className="mt-4 max-w-md mx-auto border-accent/30 bg-accent/5">
            <CardContent className="p-4 text-xs text-muted-foreground">
              <div className="font-medium text-accent mb-2">Venice AI Status</div>
              <div>Text Model: {apiConfig?.textModel || 'Not set'}</div>
              <div>Image Model: {apiConfig?.imageModel || 'Not set'}</div>
              <div>Has API Key: {apiConfig?.apiKey ? 'Yes' : 'No'}</div>
              <div>Images will be: {apiConfig?.apiKey ? 'AI Generated' : 'SVG Placeholders'}</div>
            </CardContent>
          </Card>
        </div>

      {/* Girls Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {girls.map((girl) => (
          <Card 
            key={girl.id} 
            className="h-full hover:shadow-lg hover:shadow-secondary/20 transition-all duration-300 border-2 hover:border-secondary/50 overflow-hidden"
          >
            {/* Image */}
            <div className="relative">
              <img 
                src={girl.imageUrl} 
                alt={girl.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-secondary/90 text-secondary-foreground">
                  {girl.age}
                </Badge>
              </div>
            </div>
            
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-center">{girl.name}</CardTitle>
              <div className="text-center">
                <Badge 
                  variant="outline" 
                  className="border-primary text-primary bg-primary/10"
                >
                  {girl.type}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-accent mb-1">Personality</h4>
                <p className="text-sm text-muted-foreground">{girl.personality}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-accent mb-1">Summary</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{girl.summary}</p>
              </div>

              {girl.physicalDescription && (
                <div>
                  <h4 className="text-sm font-semibold text-accent mb-1">Appearance</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{girl.physicalDescription}</p>
                </div>
              )}

              {/* AI Portrait Generator */}
              <AIPortraitGenerator
                character={{
                  name: girl.name,
                  age: girl.age,
                  type: girl.type,
                  personality: girl.personality,
                  physicalDescription: girl.physicalDescription
                }}
                onPortraitGenerated={(imageUrl, prompt) => handlePortraitGenerated(girl.id, imageUrl, prompt)}
                className="mt-4"
              />
              
              <div className="grid grid-cols-3 gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-primary text-primary hover:bg-primary/10"
                  onClick={() => handleExportCharacter(girl)}
                >
                  <Download size={14} className="mr-1" />
                  Export
                </Button>
                <Button 
                  variant={isInHarem(girl.id) ? "default" : "outline"}
                  size="sm" 
                  className={isInHarem(girl.id) 
                    ? "bg-accent text-accent-foreground" 
                    : "border-accent text-accent hover:bg-accent/10"
                  }
                  onClick={() => saveToHarem(girl)}
                  disabled={isInHarem(girl.id)}
                >
                  <Crown size={14} className="mr-1" />
                  {isInHarem(girl.id) ? 'Saved' : 'Harem'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-secondary text-secondary hover:bg-secondary/10"
                >
                  <Sparkle size={14} className="mr-1" />
                  Scene
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>

        {isGenerating && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          </div>
        )}

        {/* Export Dialog */}
        {selectedGirl && (
          <ExportDialog
            open={exportDialogOpen}
            onOpenChange={setExportDialogOpen}
            content={formatCharacterForExport(selectedGirl)}
            type="character"
            title={selectedGirl.name}
          />
        )}
      </div>
    </div>
  )
}
