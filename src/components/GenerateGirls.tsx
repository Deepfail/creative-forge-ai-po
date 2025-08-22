import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Shuffle, Sparkle, Heart, Download, Crown, ArrowLeft, Image, Settings } from '@phosphor-icons/react'
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
  imageUrl?: string
  aiPortraitPrompt?: string
  physicalDescription?: string
  isGeneratingImage?: boolean
}

interface GenerateGirlsProps {
  onBack: () => void
}

interface PromptTemplates {
  summaryPrompt: string
  physicalPrompt: string
  imagePrompt: string
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

const defaultPromptTemplates: PromptTemplates = {
  summaryPrompt: `Create a brief, engaging character summary for an adult character named {name}, age {age}, who is a {type} with a {personality} personality. Make it intriguing and hint at her appeal and backstory. Keep it under 50 words and make it slightly suggestive but tasteful.`,
  physicalPrompt: `Describe the physical appearance of {name}, a {age}-year-old {type} with a {personality} personality. Include details about her hair, eyes, body type, style, and any distinctive features. Keep it detailed but appropriate, focusing on what makes her attractive and memorable. About 2-3 sentences.`,
  imagePrompt: `Portrait of {name}, a beautiful {type}, {physicalDescription}, realistic portrait, detailed, high quality, professional photography, attractive, {personality} expression`
}

const generateRandomGirl = async (templates: PromptTemplates): Promise<GeneratedGirl> => {
  const name = femaleNames[Math.floor(Math.random() * femaleNames.length)]
  const age = Math.floor(Math.random() * 13) + 18 // 18-30
  const type = girlTypes[Math.floor(Math.random() * girlTypes.length)]
  const personality = personalities[Math.floor(Math.random() * personalities.length)]
  
  // Replace template variables
  const summaryPrompt = templates.summaryPrompt
    .replace('{name}', name)
    .replace('{age}', age.toString())
    .replace('{type}', type)
    .replace('{personality}', personality)
  
  const physicalPrompt = templates.physicalPrompt
    .replace('{name}', name)
    .replace('{age}', age.toString())
    .replace('{type}', type)
    .replace('{personality}', personality)
  
  let summary = ''
  let physicalDescription = ''
  
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
  }
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    age,
    type,
    personality,
    summary: summary.replace(/"/g, ''), // Clean up any quotes
    physicalDescription: physicalDescription.replace(/"/g, '')
  }
}

export default function GenerateGirls({ onBack }: GenerateGirlsProps) {
  const [girls, setGirls] = useState<GeneratedGirl[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedGirl, setSelectedGirl] = useState<GeneratedGirl | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [savedGirls, setSavedGirls] = useKV<SavedGirl[]>('saved-girls', [])
  const [promptTemplates, setPromptTemplates] = useKV<PromptTemplates>('girl-prompt-templates', defaultPromptTemplates)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [tempTemplates, setTempTemplates] = useState<PromptTemplates>(defaultPromptTemplates)
  const [apiConfig] = useKV<any>('api-config', { apiKey: '', textModel: 'default', imageModel: 'flux-dev' })

  const generateNewGirls = async () => {
    setIsGenerating(true)
    
    try {
      // Generate girls without images initially
      const newGirls = await Promise.all(
        Array.from({ length: 4 }, () => generateRandomGirl(promptTemplates))
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
            physicalDescription: `${name} has an alluring presence that perfectly matches her ${personality.toLowerCase()} personality.`
          }
        })
      )
      setGirls(fallbackGirls)
    }
    
    setIsGenerating(false)
  }

  const generateImageForGirl = async (girl: GeneratedGirl) => {
    // Set loading state
    setGirls(prev => prev.map(g => 
      g.id === girl.id ? { ...g, isGeneratingImage: true } : g
    ))

    try {
      // Build prompt from template
      const imagePrompt = promptTemplates.imagePrompt
        .replace('{name}', girl.name)
        .replace('{type}', girl.type)
        .replace('{physicalDescription}', girl.physicalDescription || 'attractive appearance')
        .replace('{personality}', girl.personality)

      console.log('Generating image with prompt:', imagePrompt)

      const imageUrl = await aiService.generateImage(imagePrompt, {
        width: 300,
        height: 400,
        hide_watermark: true
      })

      // Update girl with image
      setGirls(prev => prev.map(g => 
        g.id === girl.id 
          ? { ...g, imageUrl, aiPortraitPrompt: imagePrompt, isGeneratingImage: false }
          : g
      ))

      toast.success(`Image generated for ${girl.name}!`)
    } catch (error) {
      console.error('Image generation failed:', error)
      setGirls(prev => prev.map(g => 
        g.id === girl.id ? { ...g, isGeneratingImage: false } : g
      ))
      toast.error('Failed to generate image: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const saveTemplates = () => {
    setPromptTemplates(tempTemplates)
    setShowTemplateEditor(false)
    toast.success('Prompt templates saved!')
  }

  const resetTemplates = () => {
    setTempTemplates(defaultPromptTemplates)
    toast.info('Templates reset to defaults')
  }

  const saveToHarem = (girl: GeneratedGirl) => {
    const savedGirl: SavedGirl = {
      id: girl.id,
      name: girl.name,
      age: girl.age,
      type: girl.type,
      personality: girl.personality,
      summary: girl.summary,
      image: girl.imageUrl || '', // Use empty string if no image
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

  useEffect(() => {
    if (promptTemplates && promptTemplates !== tempTemplates) {
      setTempTemplates(promptTemplates)
    }
  }, [promptTemplates])

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
            <Dialog open={showTemplateEditor} onOpenChange={setShowTemplateEditor}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-accent/30 hover:bg-accent/10"
                >
                  <Settings size={16} className="mr-2" />
                  Templates
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Prompt Templates</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <Label>Summary Prompt Template</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Variables: {'{name}'}, {'{age}'}, {'{type}'}, {'{personality}'}
                    </p>
                    <Textarea
                      value={tempTemplates.summaryPrompt}
                      onChange={(e) => setTempTemplates(prev => ({ ...prev, summaryPrompt: e.target.value }))}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label>Physical Description Template</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Variables: {'{name}'}, {'{age}'}, {'{type}'}, {'{personality}'}
                    </p>
                    <Textarea
                      value={tempTemplates.physicalPrompt}
                      onChange={(e) => setTempTemplates(prev => ({ ...prev, physicalPrompt: e.target.value }))}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label>Image Generation Template</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Variables: {'{name}'}, {'{type}'}, {'{physicalDescription}'}, {'{personality}'}
                    </p>
                    <Textarea
                      value={tempTemplates.imagePrompt}
                      onChange={(e) => setTempTemplates(prev => ({ ...prev, imagePrompt: e.target.value }))}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveTemplates} className="bg-primary hover:bg-primary/90">
                      Save Templates
                    </Button>
                    <Button onClick={resetTemplates} variant="outline">
                      Reset to Defaults
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
            Generate images individually for the girls you're interested in.
          </p>
          
          {/* Debug Info */}
          <Card className="mt-4 max-w-md mx-auto border-accent/30 bg-accent/5">
            <CardContent className="p-4 text-xs text-muted-foreground">
              <div className="font-medium text-accent mb-2">Venice AI Status</div>
              <div>Text Model: {apiConfig?.textModel || 'Not set'}</div>
              <div>Image Model: {apiConfig?.imageModel || 'Not set'}</div>
              <div>Has API Key: {apiConfig?.apiKey ? 'Yes' : 'No'}</div>
              <div>Mode: Generate text only, images on demand</div>
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
            {/* Image Section */}
            <div className="relative">
              {girl.imageUrl ? (
                <>
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
                </>
              ) : (
                <div className="w-full h-48 bg-muted/30 flex flex-col items-center justify-center border-b">
                  <div className="text-center p-4">
                    <Sparkle className="mx-auto mb-2 text-muted-foreground/50" size={32} />
                    <p className="text-sm text-muted-foreground mb-3">No image generated</p>
                    <Button
                      size="sm"
                      onClick={() => generateImageForGirl(girl)}
                      disabled={girl.isGeneratingImage}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {girl.isGeneratingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Image size={14} className="mr-2" />
                          Generate Image
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-secondary/90 text-secondary-foreground">
                      {girl.age}
                    </Badge>
                  </div>
                </div>
              )}
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

              {/* Action Buttons */}
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
                {girl.imageUrl && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-secondary text-secondary hover:bg-secondary/10"
                    onClick={() => generateImageForGirl(girl)}
                    disabled={girl.isGeneratingImage}
                  >
                    <Image size={14} className="mr-1" />
                    Regen
                  </Button>
                )}
                {!girl.imageUrl && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-secondary text-secondary hover:bg-secondary/10"
                  >
                    <Sparkle size={14} className="mr-1" />
                    Scene
                  </Button>
                )}
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
