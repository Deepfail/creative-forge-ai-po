import React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Sparkle, DiceOne, Download, Copy, ArrowClockwise } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import ExportDialog from './ExportDialog'
import { aiService } from '@/lib/ai-service'

type CreationType = 'character' | 'scenario'

interface RandomGeneratorProps {
  type: CreationType
  onBack: () => void
}

interface RandomResult {
  title: string
  content: string
  tags: string[]
  genre: string
  tone: string
  nsfwLevel: string
}

const randomPresets = {
  character: {
    genres: ['Fantasy', 'Sci-Fi', 'Modern', 'Historical', 'Horror', 'Romance', 'BDSM', 'Supernatural', 'Cyberpunk', 'Post-Apocalyptic'],
    tones: ['Playful', 'Serious', 'Dark', 'Romantic', 'Sensual', 'Dominant', 'Submissive', 'Mysterious', 'Humorous', 'Seductive'],
    archetypes: ['Mysterious Stranger', 'Dominant CEO', 'Shy Librarian', 'Bad Boy/Girl', 'Noble Knight', 'Rebel Leader', 'Magic User', 'Alien Visitor', 'Time Traveler', 'Vampire/Supernatural'],
    traits: ['Confident', 'Shy', 'Dominant', 'Submissive', 'Flirtatious', 'Mysterious', 'Playful', 'Serious', 'Innocent', 'Experienced', 'Rebellious', 'Noble']
  },
  scenario: {
    genres: ['Adventure', 'Drama', 'Romance', 'Mystery', 'Horror', 'Comedy', 'Erotic', 'Fantasy', 'Sci-Fi', 'Modern', 'Historical'],
    tones: ['Passionate', 'Romantic', 'Intense', 'Playful', 'Dark', 'Mysterious', 'Humorous', 'Sensual', 'Adventurous', 'Forbidden'],
    settings: ['Luxury Hotel', 'Private Island', 'Space Station', 'Medieval Castle', 'Modern Penthouse', 'Secret Laboratory', 'Enchanted Forest', 'Desert Oasis', 'Underwater City', 'Mountain Cabin'],
    situations: ['Chance Encounter', 'Forbidden Romance', 'Power Exchange', 'Reunion', 'First Meeting', 'Role Reversal', 'Secret Affair', 'Rescue Mission', 'Competition', 'Mutual Discovery']
  }
}

const nsfwLevels = ['Mild', 'Moderate', 'Explicit', 'Extreme']

export default function RandomGenerator({ type, onBack }: RandomGeneratorProps) {
  const [generatedContent, setGeneratedContent] = useState<RandomResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [history] = useKV<RandomResult[]>('random-generation-history', [])

  const getRandomElement = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)]
  }

  const generateRandomSeed = () => {
    const presets = randomPresets[type]
    
    if (type === 'character') {
      return {
        genre: getRandomElement(presets.genres),
        tone: getRandomElement(presets.tones),
        archetype: getRandomElement((presets as typeof randomPresets.character).archetypes),
        traits: [
          getRandomElement((presets as typeof randomPresets.character).traits),
          getRandomElement((presets as typeof randomPresets.character).traits),
          getRandomElement((presets as typeof randomPresets.character).traits)
        ].filter((trait, index, arr) => arr.indexOf(trait) === index), // Remove duplicates
        nsfwLevel: getRandomElement(nsfwLevels)
      }
    } else {
      return {
        genre: getRandomElement(presets.genres),
        tone: getRandomElement(presets.tones),
        setting: getRandomElement((presets as typeof randomPresets.scenario).settings),
        situation: getRandomElement((presets as typeof randomPresets.scenario).situations),
        nsfwLevel: getRandomElement(nsfwLevels)
      }
    }
  }

  const generateRandom = async () => {
    setIsGenerating(true)
    
    try {
      const seed = generateRandomSeed()
      
      const prompt = `Generate a random NSFW ${type} with these specifications:
        
        ${type === 'character' ? `
        Genre: ${seed.genre}
        Tone: ${seed.tone}
        Archetype: ${(seed as any).archetype}
        Key Traits: ${(seed as any).traits.join(', ')}
        NSFW Level: ${seed.nsfwLevel}
        
        Create a detailed character including:
        - A creative, fitting name
        - Full personality with sexual preferences and kinks
        - Background story including romantic/sexual history
        - Physical description with intimate details
        - Motivations, desires, and fears
        - Special abilities or talents
        - Turn-ons, turn-offs, and boundaries
        - Preferred scenarios and relationship dynamics
        ` : `
        Genre: ${seed.genre}
        Tone: ${seed.tone}
        Setting: ${(seed as any).setting}
        Central Situation: ${(seed as any).situation}
        NSFW Level: ${seed.nsfwLevel}
        
        Create a detailed scenario including:
        - A compelling title
        - Rich setting and atmosphere description
        - Key characters and their roles/relationships
        - Central conflict or sexual tension
        - Potential plot developments and encounters
        - Multiple possible outcomes or paths
        - Specific intimate moments and encounters
        - Interactive elements or player choices
        `}
        
        Make it creative, unexpected, and engaging. This is for adult content creation (18+) so include explicit sexual themes as appropriate for the NSFW level.
        
        Format the output with clear sections and include content warnings at the beginning.`
      
      const content = await aiService.generateText(prompt, {
        systemPrompt: "You are an expert at creating high-quality adult content. Generate creative, detailed NSFW characters and scenarios with explicit sexual themes. Be creative and unexpected while maintaining quality.",
        temperature: 0.9,
        maxTokens: 2000,
        hideReasoning: true
      })
      
      // Extract title from content (look for first line or "Title:" section)
      const lines = content.split('\n')
      let title = `Random ${type.charAt(0).toUpperCase() + type.slice(1)}`
      
      // Try to find a title in the generated content
      for (const line of lines.slice(0, 5)) { // Check first 5 lines
        if (line.includes('Title:') || line.includes('Name:')) {
          title = line.replace(/^(Title:|Name:)\s*/i, '').trim()
          break
        } else if (line.trim() && !line.toLowerCase().includes('warning') && !line.toLowerCase().includes('content')) {
          title = line.trim()
          break
        }
      }
      
      const result: RandomResult = {
        title,
        content,
        tags: type === 'character' ? (seed as any).traits : [seed.genre, seed.tone],
        genre: seed.genre,
        tone: seed.tone,
        nsfwLevel: seed.nsfwLevel
      }
      
      setGeneratedContent(result)
      toast.success(`Random ${type} generated successfully!`)
      
    } catch (error) {
      toast.error('Failed to generate random content. Please try again.')
      console.error('Random generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (generatedContent) {
      try {
        await navigator.clipboard.writeText(generatedContent.content)
        toast.success('Content copied to clipboard!')
      } catch (error) {
        toast.error('Failed to copy content')
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Random Generator: {type.charAt(0).toUpperCase() + type.slice(1)}</h1>
            <p className="text-muted-foreground">Generate completely random NSFW {type}s with the click of a button</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Generator */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                  <DiceOne className="text-primary" size={48} weight="duotone" />
                </div>
                <CardTitle className="text-2xl">Random {type.charAt(0).toUpperCase() + type.slice(1)} Generator</CardTitle>
                <CardDescription className="text-lg">
                  Let AI surprise you with completely random NSFW content based on thousands of possible combinations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!generatedContent ? (
                  <div className="text-center py-12">
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Click the button below to generate a completely random {type} with:
                      </p>
                      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-sm">
                        <div className="space-y-2">
                          <p className="font-medium">Random Genre</p>
                          <p className="font-medium">Random Tone</p>
                          {type === 'character' && (
                            <>
                              <p className="font-medium">Random Archetype</p>
                              <p className="font-medium">Random Traits</p>
                            </>
                          )}
                          {type === 'scenario' && (
                            <>
                              <p className="font-medium">Random Setting</p>
                              <p className="font-medium">Random Situation</p>
                            </>
                          )}
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium">Random NSFW Level</p>
                          <p className="font-medium">Unique Story</p>
                          <p className="font-medium">Creative Details</p>
                          <p className="font-medium">Unexpected Elements</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Generated Content Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{generatedContent.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary">{generatedContent.genre}</Badge>
                          <Badge variant="secondary">{generatedContent.tone}</Badge>
                          <Badge variant="outline">{generatedContent.nsfwLevel} NSFW</Badge>
                          {generatedContent.tags.map(tag => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <Button onClick={generateRandom} variant="outline" size="sm">
                        <ArrowClockwise size={16} className="mr-2" />
                        New Random
                      </Button>
                    </div>
                    
                    {/* Generated Content */}
                    <div className="bg-muted p-6 rounded-lg max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm font-mono">{generatedContent.content}</pre>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button onClick={handleCopy} variant="outline" className="flex-1">
                        <Copy size={16} className="mr-2" />
                        Copy Content
                      </Button>
                      <Button onClick={() => setShowExport(true)} className="flex-1">
                        <Download size={16} className="mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Generate Button */}
                {!generatedContent && (
                  <Button 
                    onClick={generateRandom} 
                    className="w-full h-16 text-lg bg-primary hover:bg-primary/90 text-primary-foreground" 
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Sparkle size={24} className="mr-3 animate-spin" />
                        Generating Random {type.charAt(0).toUpperCase() + type.slice(1)}...
                      </>
                    ) : (
                      <>
                        <DiceOne size={24} className="mr-3" />
                        Generate Random {type.charAt(0).toUpperCase() + type.slice(1)}
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side Info */}
          <div className="space-y-6">
            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How Random Generation Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>AI selects random combinations from hundreds of possibilities</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Each generation is completely unique and unexpected</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Perfect for discovering new kinks and scenarios</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p>Great inspiration for your own creations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Possible Elements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Random Elements</CardTitle>
                <CardDescription>Examples of what might be generated</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-sm mb-2">Genres ({randomPresets[type].genres.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {randomPresets[type].genres.slice(0, 6).map(genre => (
                        <Badge key={genre} variant="outline" className="text-xs">{genre}</Badge>
                      ))}
                      <Badge variant="outline" className="text-xs">+{randomPresets[type].genres.length - 6} more</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium text-sm mb-2">Tones ({randomPresets[type].tones.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {randomPresets[type].tones.slice(0, 6).map(tone => (
                        <Badge key={tone} variant="outline" className="text-xs">{tone}</Badge>
                      ))}
                      <Badge variant="outline" className="text-xs">+{randomPresets[type].tones.length - 6} more</Badge>
                    </div>
                  </div>
                  
                  {type === 'character' && (
                    <div>
                      <p className="font-medium text-sm mb-2">Archetypes</p>
                      <div className="flex flex-wrap gap-1">
                        {(randomPresets.character.archetypes).slice(0, 4).map(archetype => (
                          <Badge key={archetype} variant="outline" className="text-xs">{archetype}</Badge>
                        ))}
                        <Badge variant="outline" className="text-xs">+more</Badge>
                      </div>
                    </div>
                  )}
                  
                  {type === 'scenario' && (
                    <div>
                      <p className="font-medium text-sm mb-2">Settings</p>
                      <div className="flex flex-wrap gap-1">
                        {(randomPresets.scenario.settings).slice(0, 4).map(setting => (
                          <Badge key={setting} variant="outline" className="text-xs">{setting}</Badge>
                        ))}
                        <Badge variant="outline" className="text-xs">+more</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Pro Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Use random generation for inspiration when you're stuck</p>
                  <p>• Generate multiple times to find unexpected combinations</p>
                  <p>• Copy interesting elements to use in custom creations</p>
                  <p>• Random content often leads to unique roleplay ideas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ExportDialog
        open={showExport}
        onOpenChange={setShowExport}
        content={generatedContent?.content || ''}
        type={type}
        title={generatedContent?.title || `Random ${type}`}
      />
    </div>
  )
}