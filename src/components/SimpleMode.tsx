import React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Sparkle, Download, Copy, Plus } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import ExportDialog from './ExportDialog'

type CreationType = 'character' | 'scenario' | 'game' | 'prompt'

interface SimpleModeProps {
  type: CreationType
  onBack: () => void
}

interface FormData {
  name: string
  description: string
  genre: string
  tone: string
  complexity: string
  tags: string[]
  customDetails: string
}

const genreOptions = {
  character: ['Fantasy', 'Sci-Fi', 'Modern', 'Historical', 'Horror', 'Romance', 'Mystery'],
  scenario: ['Adventure', 'Drama', 'Action', 'Mystery', 'Horror', 'Romance', 'Comedy'],
  game: ['RPG', 'Strategy', 'Action', 'Puzzle', 'Simulation', 'Card Game', 'Board Game'],
  prompt: ['Creative Writing', 'Role-play', 'Educational', 'Business', 'Technical', 'Personal']
}

const toneOptions = ['Serious', 'Humorous', 'Dark', 'Light-hearted', 'Epic', 'Mysterious', 'Romantic']
const complexityOptions = ['Simple', 'Moderate', 'Complex', 'Very Complex']

const tagOptions = {
  character: ['Heroic', 'Villainous', 'Mysterious', 'Comedic', 'Tragic', 'Wise', 'Rebellious', 'Noble'],
  scenario: ['High Stakes', 'Intrigue', 'Combat', 'Social', 'Exploration', 'Mystery', 'Romance', 'Survival'],
  game: ['Competitive', 'Cooperative', 'Solo', 'Strategic', 'Luck-based', 'Skill-based', 'Creative', 'Educational'],
  prompt: ['Structured', 'Open-ended', 'Specific', 'General', 'Creative', 'Analytical', 'Descriptive', 'Instructional']
}

export default function SimpleMode({ type, onBack }: SimpleModeProps) {
  const [customTags, setCustomTags] = useKV<string[]>('custom-tags', [])
  const [newCustomTag, setNewCustomTag] = useState('')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    genre: '',
    tone: '',
    complexity: '',
    tags: [],
    customDetails: ''
  })
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [projects] = useKV<any[]>('simple-projects', [])

  // Combine predefined and custom tags
  const allTags = [...tagOptions[type], ...(customTags || [])]

  const addCustomTag = () => {
    if (!newCustomTag.trim()) return
    const trimmedTag = newCustomTag.trim()
    
    // Check if tag already exists (case insensitive)
    const exists = allTags.some(tag => tag.toLowerCase() === trimmedTag.toLowerCase())
    if (exists) {
      toast.error('Tag already exists')
      return
    }
    
    setCustomTags(current => [...(current || []), trimmedTag])
    setNewCustomTag('')
    toast.success('Custom tag added!')
  }

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const handleGenerate = async () => {
    if (!formData.name.trim()) {
      toast.error('Please provide a name for your creation')
      return
    }

    setIsGenerating(true)
    try {
      const prompt = (window as any).spark.llmPrompt`
        Create a detailed ${type} with the following specifications:
        
        Name: ${formData.name}
        Description: ${formData.description || 'No specific description provided'}
        Genre: ${formData.genre || 'Any'}
        Tone: ${formData.tone || 'Balanced'}
        Complexity: ${formData.complexity || 'Moderate'}
        Tags/Characteristics: ${formData.tags.join(', ') || 'None specified'}
        Additional Details: ${formData.customDetails || 'None'}
        
        Please generate a comprehensive ${type} that includes:
        ${type === 'character' ? `
        - Full name and basic demographics
        - Detailed personality traits and quirks
        - Background and history
        - Goals, motivations, and fears
        - Physical description
        - Special abilities or skills
        - Relationships and connections
        - Notable possessions or items
        ` : type === 'scenario' ? `
        - Setting and environment description
        - Key characters involved
        - Central conflict or situation
        - Potential plot developments
        - Important locations
        - Atmosphere and mood
        - Possible outcomes or resolutions
        - Hooks for player/reader engagement
        ` : type === 'game' ? `
        - Core game mechanics
        - Rules and objectives
        - Player roles and abilities
        - Game components (if applicable)
        - Win/lose conditions
        - Difficulty scaling
        - Estimated play time
        - Setup instructions
        ` : `
        - Clear objective and context
        - Detailed instructions
        - Expected output format
        - Key constraints or requirements
        - Examples if helpful
        - Tone and style guidelines
        - Success criteria
        - Common pitfalls to avoid
        `}
        
        Make it engaging, well-structured, and ready to use. Format it with clear sections and bullet points where appropriate.
      `
      
      const result = await (window as any).spark.llm(prompt)
      setGeneratedContent(result)
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} generated successfully!`)
    } catch (error) {
      toast.error('Failed to generate content. Please try again.')
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent)
      toast.success('Content copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy content')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Simple Mode: {type.charAt(0).toUpperCase() + type.slice(1)}</h1>
            <p className="text-muted-foreground">Fill out the form below to generate your {type}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Creation Details</CardTitle>
              <CardDescription>Provide as much or as little detail as you want</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder={`Enter ${type} name...`}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder={`Brief description of your ${type}...`}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Genre</Label>
                  <Select value={formData.genre} onValueChange={(value) => setFormData(prev => ({ ...prev, genre: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genreOptions[type].map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={formData.tone} onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map(tone => (
                        <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Complexity</Label>
                <Select value={formData.complexity} onValueChange={(value) => setFormData(prev => ({ ...prev, complexity: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    {complexityOptions.map(complexity => (
                      <SelectItem key={complexity} value={complexity}>{complexity}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Tags & Characteristics</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={formData.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom tag..."
                    value={newCustomTag}
                    onChange={(e) => setNewCustomTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCustomTag()
                        if (newCustomTag.trim()) {
                          handleTagToggle(newCustomTag.trim())
                        }
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      addCustomTag()
                      if (newCustomTag.trim()) {
                        handleTagToggle(newCustomTag.trim())
                      }
                    }}
                    className="px-3"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom">Additional Details</Label>
                <Textarea
                  id="custom"
                  placeholder="Any specific requirements, details, or inspiration..."
                  value={formData.customDetails}
                  onChange={(e) => setFormData(prev => ({ ...prev, customDetails: e.target.value }))}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                className="w-full" 
                disabled={isGenerating || !formData.name.trim()}
              >
                {isGenerating ? (
                  <>
                    <Sparkle size={16} className="mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkle size={16} className="mr-2" />
                    Generate {type.charAt(0).toUpperCase() + type.slice(1)}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Content */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription>
                {generatedContent ? 'Your AI-generated content is ready!' : 'Generated content will appear here'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono">{generatedContent}</pre>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCopy} variant="outline" size="sm" className="flex-1">
                      <Copy size={16} className="mr-2" />
                      Copy
                    </Button>
                    <Button onClick={() => setShowExport(true)} size="sm" className="flex-1">
                      <Download size={16} className="mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Sparkle size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Fill out the form and click generate to see your {type} here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ExportDialog
        open={showExport}
        onOpenChange={setShowExport}
        content={generatedContent}
        type={type}
        title={formData.name}
      />
    </div>
  )
}