import React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Sparkles, Download, Copy } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import ExportDialog from './ExportDialog'

type CreationType = 'character' | 'scenario' | 'game' | 'prompt'

interface InteractiveModeProps {
  type: CreationType
  onBack: () => void
}

interface StepData {
  id: string
  question: string
  type: 'choice' | 'multi-choice' | 'text' | 'visual-choice'
  options?: Array<{ id: string; label: string; description?: string; visual?: string }>
  answer?: string | string[]
}

const getStepsForType = (type: CreationType): StepData[] => {
  const commonSteps = [
    {
      id: 'genre',
      question: `What genre or style should your ${type} be?`,
      type: 'visual-choice' as const,
      options: type === 'character' ? [
        { id: 'fantasy', label: 'Fantasy', description: 'Magical worlds with mythical creatures', visual: '🧙‍♂️' },
        { id: 'scifi', label: 'Sci-Fi', description: 'Futuristic technology and space', visual: '🚀' },
        { id: 'modern', label: 'Modern', description: 'Contemporary real-world setting', visual: '🏙️' },
        { id: 'historical', label: 'Historical', description: 'Past eras and time periods', visual: '🏛️' }
      ] : type === 'scenario' ? [
        { id: 'adventure', label: 'Adventure', description: 'Exploration and discovery', visual: '🗺️' },
        { id: 'mystery', label: 'Mystery', description: 'Puzzles and hidden secrets', visual: '🔍' },
        { id: 'action', label: 'Action', description: 'Fast-paced and intense', visual: '⚔️' },
        { id: 'social', label: 'Social', description: 'Character interactions and drama', visual: '🎭' }
      ] : type === 'game' ? [
        { id: 'rpg', label: 'RPG', description: 'Character progression and storytelling', visual: '🎲' },
        { id: 'strategy', label: 'Strategy', description: 'Tactical thinking and planning', visual: '♟️' },
        { id: 'puzzle', label: 'Puzzle', description: 'Problem-solving challenges', visual: '🧩' },
        { id: 'party', label: 'Party Game', description: 'Fun social gameplay', visual: '🎉' }
      ] : [
        { id: 'creative', label: 'Creative Writing', description: 'Artistic and imaginative content', visual: '✍️' },
        { id: 'roleplay', label: 'Role-play', description: 'Character interactions and scenarios', visual: '🎭' },
        { id: 'educational', label: 'Educational', description: 'Learning and instruction', visual: '📚' },
        { id: 'business', label: 'Business', description: 'Professional and practical', visual: '💼' }
      ]
    }
  ]

  if (type === 'character') {
    return [
      ...commonSteps,
      {
        id: 'personality',
        question: 'What kind of personality should your character have?',
        type: 'multi-choice',
        options: [
          { id: 'brave', label: 'Brave', description: 'Faces danger head-on' },
          { id: 'clever', label: 'Clever', description: 'Solves problems with wit' },
          { id: 'mysterious', label: 'Mysterious', description: 'Has hidden depths' },
          { id: 'charismatic', label: 'Charismatic', description: 'Natural leader and charmer' },
          { id: 'rebellious', label: 'Rebellious', description: 'Questions authority' },
          { id: 'compassionate', label: 'Compassionate', description: 'Cares deeply for others' }
        ]
      },
      {
        id: 'role',
        question: 'What role should this character play?',
        type: 'choice',
        options: [
          { id: 'hero', label: 'Hero', description: 'The main protagonist' },
          { id: 'mentor', label: 'Mentor', description: 'Wise guide and teacher' },
          { id: 'sidekick', label: 'Sidekick', description: 'Loyal companion' },
          { id: 'antagonist', label: 'Antagonist', description: 'The opposing force' },
          { id: 'npc', label: 'NPC', description: 'Supporting character' }
        ]
      },
      {
        id: 'backstory',
        question: 'What shaped this character\'s past?',
        type: 'visual-choice',
        options: [
          { id: 'tragic', label: 'Tragic Loss', description: 'Overcame great hardship', visual: '💔' },
          { id: 'privileged', label: 'Privileged', description: 'Born into wealth/power', visual: '👑' },
          { id: 'outcast', label: 'Outcast', description: 'Never quite fit in', visual: '🚪' },
          { id: 'destined', label: 'Destined', description: 'Born for a special purpose', visual: '⭐' }
        ]
      }
    ]
  }

  if (type === 'scenario') {
    return [
      ...commonSteps,
      {
        id: 'conflict',
        question: 'What type of conflict drives the scenario?',
        type: 'choice',
        options: [
          { id: 'external', label: 'External Threat', description: 'Outside force threatens the characters' },
          { id: 'internal', label: 'Internal Struggle', description: 'Characters face personal demons' },
          { id: 'resource', label: 'Resource Scarcity', description: 'Competition for limited resources' },
          { id: 'moral', label: 'Moral Dilemma', description: 'Difficult ethical choices' }
        ]
      },
      {
        id: 'setting',
        question: 'Where does this scenario take place?',
        type: 'visual-choice',
        options: [
          { id: 'urban', label: 'Urban', description: 'City streets and buildings', visual: '🏢' },
          { id: 'wilderness', label: 'Wilderness', description: 'Natural environments', visual: '🌲' },
          { id: 'underground', label: 'Underground', description: 'Caves, tunnels, dungeons', visual: '🕳️' },
          { id: 'otherworldly', label: 'Otherworldly', description: 'Strange or magical places', visual: '✨' }
        ]
      },
      {
        id: 'stakes',
        question: 'What are the stakes if characters fail?',
        type: 'multi-choice',
        options: [
          { id: 'life', label: 'Life & Death', description: 'Characters could die' },
          { id: 'world', label: 'World in Peril', description: 'Global consequences' },
          { id: 'personal', label: 'Personal Loss', description: 'Lose something precious' },
          { id: 'reputation', label: 'Reputation', description: 'Social standing at risk' }
        ]
      }
    ]
  }

  if (type === 'game') {
    return [
      ...commonSteps,
      {
        id: 'players',
        question: 'How many players should this game support?',
        type: 'choice',
        options: [
          { id: 'solo', label: 'Solo (1 player)', description: 'Single-player experience' },
          { id: 'duo', label: 'Duo (2 players)', description: 'Perfect for couples or friends' },
          { id: 'small', label: 'Small Group (3-4)', description: 'Intimate group gameplay' },
          { id: 'party', label: 'Party (5+)', description: 'Large group fun' }
        ]
      },
      {
        id: 'complexity',
        question: 'How complex should the game be?',
        type: 'visual-choice',
        options: [
          { id: 'simple', label: 'Simple', description: 'Easy to learn and play', visual: '🟢' },
          { id: 'moderate', label: 'Moderate', description: 'Some learning required', visual: '🟡' },
          { id: 'complex', label: 'Complex', description: 'Deep strategic gameplay', visual: '🔴' },
          { id: 'expert', label: 'Expert', description: 'For experienced gamers', visual: '⚫' }
        ]
      },
      {
        id: 'duration',
        question: 'How long should a typical game session last?',
        type: 'choice',
        options: [
          { id: 'quick', label: 'Quick (15-30 min)', description: 'Fast and casual' },
          { id: 'medium', label: 'Medium (30-60 min)', description: 'Standard session' },
          { id: 'long', label: 'Long (1-2 hours)', description: 'Deep engagement' },
          { id: 'campaign', label: 'Campaign (Multiple sessions)', description: 'Ongoing story' }
        ]
      }
    ]
  }

  // Prompt type
  return [
    ...commonSteps,
    {
      id: 'purpose',
      question: 'What is the main purpose of this prompt?',
      type: 'choice',
      options: [
        { id: 'generate', label: 'Generate Content', description: 'Create new written content' },
        { id: 'analyze', label: 'Analyze Information', description: 'Break down and examine data' },
        { id: 'roleplay', label: 'Role-play Scenario', description: 'Engage in character interactions' },
        { id: 'instruct', label: 'Give Instructions', description: 'Provide step-by-step guidance' }
      ]
    },
    {
      id: 'tone',
      question: 'What tone should the AI use?',
      type: 'visual-choice',
      options: [
        { id: 'professional', label: 'Professional', description: 'Business-like and formal', visual: '💼' },
        { id: 'casual', label: 'Casual', description: 'Friendly and conversational', visual: '😊' },
        { id: 'creative', label: 'Creative', description: 'Imaginative and expressive', visual: '🎨' },
        { id: 'technical', label: 'Technical', description: 'Precise and detailed', visual: '⚙️' }
      ]
    },
    {
      id: 'constraints',
      question: 'What constraints should the prompt include?',
      type: 'multi-choice',
      options: [
        { id: 'length', label: 'Length Limits', description: 'Specify word/character count' },
        { id: 'format', label: 'Format Requirements', description: 'Structure and organization' },
        { id: 'style', label: 'Style Guidelines', description: 'Writing style preferences' },
        { id: 'content', label: 'Content Restrictions', description: 'What to include/avoid' }
      ]
    }
  ]
}

export default function InteractiveMode({ type, onBack }: InteractiveModeProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showExport, setShowExport] = useState(false)

  const steps = getStepsForType(type)
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleAnswer = (stepId: string, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [stepId]: answer }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      generateContent()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const canProceed = () => {
    const currentStepData = steps[currentStep]
    const answer = answers[currentStepData.id]
    return answer && (Array.isArray(answer) ? answer.length > 0 : answer.trim() !== '')
  }

  const generateContent = async () => {
    setIsGenerating(true)
    try {
      const answerSummary = steps.map(step => {
        const answer = answers[step.id]
        const answerText = Array.isArray(answer) ? answer.join(', ') : answer
        return `${step.question}: ${answerText}`
      }).join('\n')

      const prompt = spark.llmPrompt`
        Based on this interactive questionnaire about creating a ${type}, generate comprehensive content:

        User Responses:
        ${answerSummary}

        Please create a detailed ${type} that incorporates all of these preferences and choices. Make it engaging, well-structured, and ready to use.

        ${type === 'character' ? `
        Include: Full character profile with name, appearance, personality, backstory, motivations, abilities, relationships, and notable possessions.
        ` : type === 'scenario' ? `
        Include: Setting description, key characters, central conflict, plot hooks, atmosphere, potential developments, and resolution possibilities.
        ` : type === 'game' ? `
        Include: Game overview, rules, objectives, setup, gameplay mechanics, win conditions, and example scenarios.
        ` : `
        Include: Complete prompt with clear instructions, context, expected format, examples, constraints, and success criteria.
        `}

        Format with clear sections and make it immediately usable.
      `

      const result = await spark.llm(prompt)
      setGeneratedContent(result)
      toast.success('Your creation is ready!')
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

  if (generatedContent) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Your {type.charAt(0).toUpperCase() + type.slice(1)} is Ready!</h1>
              <p className="text-muted-foreground">Generated based on your interactive choices</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription>Your personalized {type} created through the interactive process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-6 rounded-lg max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono">{generatedContent}</pre>
              </div>
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
            </CardContent>
          </Card>

          <ExportDialog
            open={showExport}
            onOpenChange={setShowExport}
            content={generatedContent}
            type={type}
            title={`Interactive ${type}`}
          />
        </div>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Sparkles size={48} className="mx-auto mb-4 text-primary animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Creating Your {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
            <p className="text-muted-foreground mb-4">Our AI is crafting something amazing based on your choices...</p>
            <Progress value={100} className="animate-pulse" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStepData = steps[currentStep]
  const currentAnswer = answers[currentStepData.id]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Interactive {type.charAt(0).toUpperCase() + type.slice(1)} Creator</h1>
            <p className="text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">{currentStepData.question}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentStepData.type === 'choice' && (
              <div className="space-y-3">
                {currentStepData.options?.map(option => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      currentAnswer === option.id ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleAnswer(currentStepData.id, option.id)}
                  >
                    <CardContent className="p-4">
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {currentStepData.type === 'multi-choice' && (
              <div className="space-y-3">
                {currentStepData.options?.map(option => {
                  const selectedOptions = Array.isArray(currentAnswer) ? currentAnswer : []
                  const isSelected = selectedOptions.includes(option.id)
                  return (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => {
                        const newSelection = isSelected
                          ? selectedOptions.filter(id => id !== option.id)
                          : [...selectedOptions, option.id]
                        handleAnswer(currentStepData.id, newSelection)
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="font-medium">{option.label}</div>
                        {option.description && (
                          <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {currentStepData.type === 'visual-choice' && (
              <div className="grid grid-cols-2 gap-4">
                {currentStepData.options?.map(option => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      currentAnswer === option.id ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleAnswer(currentStepData.id, option.id)}
                  >
                    <CardContent className="p-4 text-center">
                      {option.visual && (
                        <div className="text-4xl mb-3">{option.visual}</div>
                      )}
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft size={16} className="mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Sparkles size={16} className="mr-2" />
                Generate
              </>
            ) : (
              <>
                Next
                <ArrowRight size={16} className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}