import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shuffle, Sparkles, Heart, Download } from '@phosphor-icons/react'
import AIPortraitGenerator from './AIPortraitGenerator'
import ExportDialog from './ExportDialog'
import { getAIService } from '@/lib/aiService'

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
  'Addison', 'Eleanor', 'Natalie', 'Luna', 'Savannah', 'Brooklyn', 'Leah', 'Zara',
  'Stella', 'Hazel', 'Ellie', 'Paisley', 'Audrey', 'Skylar', 'Violet', 'Claire'
]

// Placeholder image generator for now - will be replaced with AI generation
const generatePlaceholderImage = (name: string, type: string): string => {
  const seed = name + type
  const colors = ['ff6b9d', '45b7d1', '96ceb4', 'feca57', 'ff9ff3', '54a0ff']
  const color = colors[seed.length % colors.length]
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=300&rounded=true&bold=true`
}

const generateRandomGirl = async (): Promise<GeneratedGirl> => {
  const name = femaleNames[Math.floor(Math.random() * femaleNames.length)]
  const age = Math.floor(Math.random() * 13) + 18 // 18-30
  const type = girlTypes[Math.floor(Math.random() * girlTypes.length)]
  const personality = personalities[Math.floor(Math.random() * personalities.length)]
  
  // Generate AI summary and physical description using the configured AI service
  const summaryPrompt = `Create a brief, engaging character summary for an adult character named ${name}, age ${age}, who is a ${type} with a ${personality} personality. Make it intriguing and hint at her appeal and backstory. Keep it under 50 words and make it slightly suggestive but tasteful.`
  
  const physicalPrompt = `Describe the physical appearance of ${name}, a ${age}-year-old ${type} with a ${personality} personality. Include details about her hair, eyes, body type, style, and any distinctive features. Keep it detailed but appropriate, focusing on what makes her attractive and memorable. About 2-3 sentences.`
  
  let summary = ''
  let physicalDescription = ''
  try {
    const aiService = await getAIService()
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
    physicalDescription: physicalDescription.replace(/"/g, ''),
    imageUrl: generatePlaceholderImage(name, type)
  }
}

export default function GenerateGirls() {
  const [girls, setGirls] = useState<GeneratedGirl[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedGirl, setSelectedGirl] = useState<GeneratedGirl | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

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
      const fallbackGirls = Array.from({ length: 4 }, () => {
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
          imageUrl: generatePlaceholderImage(name, type)
        }
      })
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Heart className="text-secondary" size={32} weight="fill" />
          <h2 className="text-3xl font-bold text-foreground">Generate Girls</h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          Discover randomly generated characters with unique personalities and traits. 
          Each girl is created with detailed characteristics perfect for your scenarios.
        </p>
        <Button 
          onClick={generateNewGirls}
          disabled={isGenerating}
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          size="lg"
        >
          <Shuffle size={20} className="mr-2" />
          {isGenerating ? 'Generating...' : 'Generate New Girls'}
        </Button>
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
              
              <div className="grid grid-cols-2 gap-2 mt-4">
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
                  variant="outline" 
                  size="sm" 
                  className="border-secondary text-secondary hover:bg-secondary/10"
                >
                  <Sparkles size={14} className="mr-1" />
                  Scenario
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
  )
}