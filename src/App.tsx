import React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkle, Lightning, User, GameController, DiceOne, ChatCircle, Users, Gear, Crown, Chat } from '@phosphor-icons/react'
import SimpleMode from './components/SimpleMode'
import InteractiveMode from './components/InteractiveMode'
import RandomGenerator from './components/RandomGenerator'
import CustomChatBuilder from './components/CustomChatBuilder'
import GenerateGirls from './components/GenerateGirls'
import ApiSettings from './components/ApiSettings'
import Harem from './components/Harem'
import PromptsManager from './components/PromptsManager'
import ImageGenerationTest from './components/ImageGenerationTest'
import { aiService } from './lib/ai-service'
import { useKV } from '@github/spark/hooks'
import type { ApiConfig } from './components/ApiSettings'

type CreationType = 'character' | 'scenario'
type AppMode = 'home' | 'simple' | 'interactive' | 'random' | 'custom' | 'girls' | 'settings' | 'harem' | 'prompts' | 'image-test'

const creationTypes: Array<{
  id: CreationType
  title: string
  description: string
  icon: React.ComponentType<any>
  examples: string[]
}> = [
  {
    id: 'character',
    title: 'Character Creation',
    description: 'Create detailed NSFW characters with personalities, kinks, and backstories',
    icon: User,
    examples: ['Submissive Girl', 'Dominant MILF', 'Shy Virgin', 'Experienced Lover']
  },
  {
    id: 'scenario',
    title: 'Scenario/Game Builder',
    description: 'Build immersive NSFW scenarios and interactive experiences',
    icon: GameController,
    examples: ['Roleplay Scenarios', 'Interactive Games', 'Fantasy Settings', 'Kinky Adventures']
  }
]

function App() {
  const [mode, setMode] = useState<AppMode>('home')
  const [selectedType, setSelectedType] = useState<CreationType>('character')
  const [showSettings, setShowSettings] = useState(false)
  const [apiConfig] = useKV<ApiConfig>('api-config', {
    apiKey: '',
    textModel: 'default',
    imageModel: 'flux-dev'
  })

  // Initialize AI service with saved config
  useEffect(() => {
    console.log('Initializing AI service with config:', apiConfig)
    if (apiConfig) {
      // Always set the config, even if there's no API key for better debugging
      aiService.setConfig(apiConfig)
      console.log('AI service configured with textModel:', apiConfig.textModel, 'imageModel:', apiConfig.imageModel, 'hasKey:', !!apiConfig.apiKey)
    }
  }, [apiConfig])

  const handleModeSelect = (newMode: AppMode, type?: CreationType) => {
    if (type) setSelectedType(type)
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

  if (mode === 'random') {
    return <RandomGenerator type={selectedType} onBack={handleBack} />
  }

  if (mode === 'custom') {
    return <CustomChatBuilder onBack={handleBack} />
  }

  if (mode === 'girls') {
    return <GenerateGirls onBack={handleBack} />
  }

  if (mode === 'harem') {
    return <Harem onBack={handleBack} />
  }

  if (mode === 'prompts') {
    return <PromptsManager onBack={handleBack} />
  }

  if (mode === 'image-test') {
    return <ImageGenerationTest onBack={handleBack} />
  }

  if (showSettings) {
    return <ApiSettings 
      onClose={() => setShowSettings(false)} 
      onSave={(config) => {
        aiService.setConfig(config)
        setShowSettings(false)
      }}
    />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <Sparkle className="text-primary" size={40} weight="fill" />
              <h1 className="text-5xl font-bold text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                NSFW AI Generator
              </h1>
            </div>
            <div className="flex-1 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode('image-test')}
                className="border-accent/30 hover:bg-accent/10"
              >
                <Sparkle size={16} className="mr-2" />
                Test Images
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode('prompts')}
                className="border-secondary/30 hover:bg-secondary/10"
              >
                <Chat size={16} className="mr-2" />
                Prompts
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="border-primary/30 hover:bg-primary/10"
              >
                <Gear size={16} className="mr-2" />
                API Settings
              </Button>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Create amazing NSFW characters, scenarios, and interactive experiences with AI. 
            Choose your creation type and preferred mode to get started.
          </p>
          <div className="mt-4 text-sm text-accent font-medium">
            🔞 18+ Adult Content Only
          </div>
        </div>

        {/* Quick Access Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer group"
                onClick={() => handleModeSelect('random')}>
            <CardContent className="p-6 text-center">
              <DiceOne className="mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" size={32} weight="duotone" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Random Scenario</h3>
              <p className="text-sm text-muted-foreground">Get instant random NSFW scenarios</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30 hover:shadow-lg hover:shadow-secondary/10 transition-all cursor-pointer group"
                onClick={() => handleModeSelect('custom')}>
            <CardContent className="p-6 text-center">
              <ChatCircle className="mx-auto mb-3 text-secondary group-hover:scale-110 transition-transform" size={32} weight="duotone" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Build Your Own</h3>
              <p className="text-sm text-muted-foreground">Chat with AI to create custom scenarios</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30 hover:shadow-lg hover:shadow-accent/10 transition-all cursor-pointer group"
                onClick={() => handleModeSelect('girls')}>
            <CardContent className="p-6 text-center">
              <Users className="mx-auto mb-3 text-accent group-hover:scale-110 transition-transform" size={32} weight="duotone" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Generate Girls</h3>
              <p className="text-sm text-muted-foreground">Create random female characters</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/20 to-pink-500/5 border-pink-500/30 hover:shadow-lg hover:shadow-pink-500/10 transition-all cursor-pointer group"
                onClick={() => handleModeSelect('harem')}>
            <CardContent className="p-6 text-center">
              <Crown className="mx-auto mb-3 text-pink-500 group-hover:scale-110 transition-transform" size={32} weight="duotone" />
              <h3 className="text-lg font-semibold text-foreground mb-2">My Harem</h3>
              <p className="text-sm text-muted-foreground">Manage your saved girls collection</p>
            </CardContent>
          </Card>
        </div>

        {/* Creation Types */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {creationTypes.map((type) => {
            const Icon = type.icon
            return (
              <Card key={type.id} className="h-full hover:shadow-lg hover:shadow-primary/5 transition-all border-border/50">
                <CardHeader className="text-center pb-4">
                  <Icon className="mx-auto mb-3 text-primary" size={40} weight="duotone" />
                  <CardTitle className="text-xl text-foreground">{type.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{type.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {type.examples.map((example) => (
                      <Badge key={example} variant="secondary" className="text-xs bg-muted/50">
                        {example}
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => handleModeSelect('simple', type.id)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                      size="sm"
                    >
                      <Lightning size={16} className="mr-2" />
                      Simple Mode
                    </Button>
                    <Button 
                      onClick={() => handleModeSelect('interactive', type.id)}
                      variant="outline" 
                      className="w-full border-primary/30 hover:bg-primary/10" 
                      size="sm"
                    >
                      <Sparkle size={16} className="mr-2" />
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
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lightning className="text-primary" size={24} weight="duotone" />
                <CardTitle className="text-foreground">Simple Mode</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
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

          <Card className="border-secondary/30 bg-secondary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkle className="text-secondary" size={24} weight="duotone" />
                <CardTitle className="text-foreground">Interactive Mode</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Guided experience with questions and scenarios to spark creativity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Step-by-step guided questions</li>
                <li>• Visual choices and scenarios</li>
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