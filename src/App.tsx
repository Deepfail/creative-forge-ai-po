import React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Zap, User, GameController2, FileText, Scroll } from '@phosphor-icons/react'
import SimpleMode from './components/SimpleMode'
import InteractiveMode from './components/InteractiveMode'

type CreationType = 'character' | 'scenario' | 'game' | 'prompt'
type AppMode = 'home' | 'simple' | 'interactive'

const creationTypes: Array<{
  id: CreationType
  title: string
  description: string
  icon: React.ComponentType<any>
  examples: string[]
}> = [
  {
    id: 'character',
    title: 'Character',
    description: 'Create detailed characters with personalities, backstories, and traits',
    icon: User,
    examples: ['Fantasy Heroes', 'NPCs', 'Villains', 'Companions']
  },
  {
    id: 'scenario',
    title: 'Scenario',
    description: 'Build immersive scenarios and story situations',
    icon: Scroll,
    examples: ['Adventures', 'Conflicts', 'Settings', 'Events']
  },
  {
    id: 'game',
    title: 'Game',
    description: 'Design game mechanics, rules, and interactive experiences',
    icon: GameController2,
    examples: ['RPG Systems', 'Mini-games', 'Mechanics', 'Challenges']
  },
  {
    id: 'prompt',
    title: 'Prompt',
    description: 'Craft effective prompts for AI assistants and creative tools',
    icon: FileText,
    examples: ['Creative Writing', 'Role-play', 'Instructions', 'Templates']
  }
]

function App() {
  const [mode, setMode] = useState<AppMode>('home')
  const [selectedType, setSelectedType] = useState<CreationType>('character')

  const handleModeSelect = (newMode: AppMode, type: CreationType) => {
    setSelectedType(type)
    setMode(newMode)
  }

  const handleBack = () => {
    setMode('home')
  }

  if (mode === 'simple') {
    return <SimpleMode type={selectedType} onBack={handleBack} />
  }

  if (mode === 'interactive') {
    return <InteractiveMode type={selectedType} onBack={handleBack} />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="text-primary" size={32} weight="fill" />
            <h1 className="text-4xl font-bold text-foreground">AI Creative Generator</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create amazing characters, scenarios, games, and prompts with the power of AI. 
            Choose your creation type and preferred mode to get started.
          </p>
        </div>

        {/* Creation Types */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {creationTypes.map((type) => {
            const Icon = type.icon
            return (
              <Card key={type.id} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-4">
                  <Icon className="mx-auto mb-3 text-primary" size={32} weight="duotone" />
                  <CardTitle className="text-lg">{type.title}</CardTitle>
                  <CardDescription className="text-sm">{type.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1 mb-4">
                    {type.examples.map((example) => (
                      <Badge key={example} variant="secondary" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleModeSelect('simple', type.id)}
                      className="w-full" 
                      size="sm"
                    >
                      <Zap size={16} className="mr-2" />
                      Simple Mode
                    </Button>
                    <Button 
                      onClick={() => handleModeSelect('interactive', type.id)}
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                    >
                      <Sparkles size={16} className="mr-2" />
                      Interactive Mode
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Mode Explanations */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Zap className="text-primary" size={24} weight="duotone" />
                <CardTitle>Simple Mode</CardTitle>
              </div>
              <CardDescription>
                Quick and direct creation for users who know exactly what they want
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Fill out forms with specific details</li>
                <li>• Select from predefined characteristics</li>
                <li>• Fast creation process (under 2 minutes)</li>
                <li>• Perfect for experienced users</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="text-secondary" size={24} weight="duotone" />
                <CardTitle>Interactive Mode</CardTitle>
              </div>
              <CardDescription>
                Guided experience with questions and scenarios to spark creativity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Step-by-step guided questions</li>
                <li>• Visual choices and mini-scenarios</li>
                <li>• Great for discovering new ideas</li>
                <li>• Interactive and inspiring process</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default App