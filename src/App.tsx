import React from 'react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Sparkle, Lightning, User, GameController, DiceOne, ChatCircle, Users, Gear, Crown, Chat } from '@phosphor-icons/react'
import { ErrorBoundary } from 'react-error-boundary'
import SafeApp from './components/SafeApp'

// Modern components
import { SessionProvider, useSession } from './contexts/SessionContext'
import { ModernLayout, PageTransition } from './components/ModernLayout'
import { ModernCard, FeatureCard, InfoCard } from './components/ModernCard'
import { ModernButton, ModeButton } from './components/ModernButton'
import { ThemeToggle } from './components/ThemeToggle'

// Lazy load components to prevent initial load crashes
const SimpleMode = React.lazy(() => import('./components/SimpleMode'))
const InteractiveMode = React.lazy(() => import('./components/InteractiveMode'))
const RandomGenerator = React.lazy(() => import('./components/RandomGenerator'))
const CustomChatBuilder = React.lazy(() => import('./components/CustomChatBuilder'))
const GenerateGirls = React.lazy(() => import('./components/GenerateGirls'))
const ApiSettings = React.lazy(() => import('./components/ApiSettings'))
const Harem = React.lazy(() => import('./components/Harem'))
const PromptsManager = React.lazy(() => import('./components/PromptsManager'))
const TemplateEditor = React.lazy(() => import('./components/TemplateEditor'))
const ScenarioTest = React.lazy(() => import('./components/ScenarioTest'))

import { aiService } from './lib/ai-service'
import { useKV } from '@github/spark/hooks'
import type { ApiConfig } from './components/ApiSettings'

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  console.error('App-level error:', error)
  
  // If there's a critical error, fall back to safe mode
  return <SafeApp />
}

type CreationType = 'character' | 'scenario'
type AppMode = 'home' | 'simple' | 'interactive' | 'random' | 'custom' | 'girls' | 'settings' | 'harem' | 'prompts' | 'template-editor' | 'scenario-test'

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

function AppContent() {
  const { state, setMode, setType } = useSession()
  const [showSettings, setShowSettings] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isStable, setIsStable] = useState(false)
  
  const [apiConfig] = useKV<ApiConfig>('api-config', {
    apiKey: '',
    textModel: 'llama-3.3-70b',
    imageModel: 'flux-dev'
  })

  // Check system stability
  useEffect(() => {
    try {
      const checks = [
        typeof window !== 'undefined',
        window.spark !== undefined,
        typeof useKV === 'function'
      ]
      
      if (checks.every(check => check)) {
        console.log('System stability checks passed')
        setIsStable(true)
        
        if (apiConfig) {
          aiService.setConfig(apiConfig)
          console.log('AI service configured')
        }
      } else {
        console.log('System stability checks failed')
        setIsStable(false)
      }
    } catch (error) {
      console.error('Stability check error:', error)
      setIsStable(false)
    }
  }, [apiConfig])

  if (!isStable) {
    return <SafeApp />
  }

  const handleModeSelect = (newMode: AppMode, type?: CreationType) => {
    try {
      if (type) setType(type)
      setMode(newMode)
      setError(null)
    } catch (error) {
      console.error('Error changing mode:', error)
      setError('Failed to change mode')
    }
  }

  const handleBack = () => {
    try {
      setMode('home')
      setError(null)
    } catch (error) {
      console.error('Error going back:', error)
      setError('Failed to go back')
    }
  }

  // Render based on current mode with Suspense for lazy loading
  const renderCurrentMode = () => {
    if (state.currentMode === 'simple') {
      return (
        <React.Suspense fallback={<LoadingScreen />}>
          <SimpleMode type={state.selectedType as CreationType} onBack={handleBack} />
        </React.Suspense>
      )
    }

    if (state.currentMode === 'interactive') {
      return (
        <React.Suspense fallback={<LoadingScreen />}>
          <InteractiveMode type={state.selectedType as CreationType} onBack={handleBack} />
        </React.Suspense>
      )
    }

    if (state.currentMode === 'random') {
      return (
        <React.Suspense fallback={<LoadingScreen />}>
          <RandomGenerator type={state.selectedType as CreationType} onBack={handleBack} />
        </React.Suspense>
      )
    }

    if (state.currentMode === 'custom') {
      return (
        <React.Suspense fallback={<LoadingScreen />}>
          <CustomChatBuilder onBack={handleBack} />
        </React.Suspense>
      )
    }

    if (state.currentMode === 'girls') {
      return (
        <React.Suspense fallback={<LoadingScreen />}>
          <GenerateGirls onBack={handleBack} />
        </React.Suspense>
      )
    }

    if (state.currentMode === 'harem') {
      return (
        <React.Suspense fallback={<LoadingScreen />}>
          <Harem onBack={handleBack} />
        </React.Suspense>
      )
    }

    if (state.currentMode === 'prompts') {
      return (
        <React.Suspense fallback={<LoadingScreen />}>
          <PromptsManager onBack={handleBack} />
        </React.Suspense>
      )
    }

    if (state.currentMode === 'template-editor') {
      return (
        <React.Suspense fallback={<LoadingScreen />}>
          <TemplateEditor onBack={handleBack} />
        </React.Suspense>
      )
    }

    if (state.currentMode === 'scenario-test') {
      return (
        <React.Suspense fallback={<LoadingScreen />}>
          <div className="min-h-screen p-8">
            <ModernButton onClick={handleBack} className="mb-4">Back</ModernButton>
            <ScenarioTest />
          </div>
        </React.Suspense>
      )
    }

    if (showSettings) {
      return (
        <React.Suspense fallback={<LoadingScreen />}>
          <ApiSettings 
            onClose={() => setShowSettings(false)} 
            onSave={(config) => {
              aiService.setConfig(config)
              setShowSettings(false)
            }}
          />
        </React.Suspense>
      )
    }

    return <HomePage handleModeSelect={handleModeSelect} setShowSettings={setShowSettings} />
  }

  if (error) {
    return <SafeApp />
  }

  return (
    <PageTransition mode={state.currentMode}>
      {renderCurrentMode()}
    </PageTransition>
  )
}

// Loading screen component with modern styling
function LoadingScreen() {
  return (
    <ModernLayout>
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-4 w-fit"
          >
            <Sparkle className="text-primary" size={48} weight="fill" />
          </motion.div>
          <motion.p 
            className="text-muted-foreground"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading...
          </motion.p>
        </motion.div>
      </div>
    </ModernLayout>
  )
}

// Home page component with modern design
interface HomePageProps {
  handleModeSelect: (mode: AppMode, type?: CreationType) => void
  setShowSettings: (show: boolean) => void
}

function HomePage({ handleModeSelect, setShowSettings }: HomePageProps) {
  return (
    <ModernLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1" />
            <motion.div 
              className="flex items-center gap-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Sparkle className="text-primary" size={48} weight="fill" />
              </motion.div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Beatleap PC
              </h1>
            </motion.div>
            <div className="flex-1 flex justify-end gap-2">
              <ThemeToggle />
              <ModernButton
                variant="outline"
                size="sm"
                onClick={() => handleModeSelect('scenario-test')}
                className="border-yellow-500/30 hover:bg-yellow-500/10"
              >
                🧪 Test
              </ModernButton>
              <ModernButton
                variant="outline"
                size="sm"
                onClick={() => handleModeSelect('template-editor')}
                icon={<Chat size={16} />}
              >
                Templates
              </ModernButton>
              <ModernButton
                variant="outline"
                size="sm"
                onClick={() => handleModeSelect('prompts')}
                icon={<Chat size={16} />}
              >
                Prompts
              </ModernButton>
              <ModernButton
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                icon={<Gear size={16} />}
                glow
              >
                API Settings
              </ModernButton>
            </div>
          </div>
          
          <motion.p 
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Create amazing NSFW characters, scenarios, and interactive experiences with AI. 
            Choose your creation type and preferred mode to get started.
          </motion.p>
          
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent/20 to-destructive/20 rounded-full border border-accent/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            <span className="text-2xl">🔞</span>
            <span className="text-sm font-medium text-accent">18+ Adult Content Only</span>
          </motion.div>
        </motion.div>

        {/* Quick Access Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <FeatureCard
            title="Random Scenario"
            description="Get instant random NSFW scenarios"
            icon={<DiceOne className="text-primary" size={32} weight="duotone" />}
            onClick={() => handleModeSelect('random')}
            variant="primary"
            delay={0.1}
          />
          <FeatureCard
            title="Build Your Own"
            description="Chat with AI to design custom content"
            icon={<ChatCircle className="text-secondary" size={32} weight="duotone" />}
            onClick={() => handleModeSelect('custom')}
            variant="secondary"
            delay={0.2}
          />
          <FeatureCard
            title="Generate Girls"
            description="Create random female characters"
            icon={<Users className="text-accent" size={32} weight="duotone" />}
            onClick={() => handleModeSelect('girls')}
            variant="accent"
            delay={0.3}
          />
          <FeatureCard
            title="My Harem"
            description="Manage your saved girls collection"
            icon={<Crown className="text-pink-500" size={32} weight="duotone" />}
            onClick={() => handleModeSelect('harem')}
            variant="accent"
            delay={0.4}
          />
        </motion.div>

        {/* Creation Types */}
        <motion.div 
          className="grid md:grid-cols-2 gap-8 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          {creationTypes.map((type, index) => {
            const Icon = type.icon
            return (
              <ModernCard
                key={type.id}
                variant="highlight"
                delay={0.1 + index * 0.2}
                className="h-full"
              >
                <div className="p-8 text-center">
                  <motion.div
                    className="mx-auto mb-6 w-fit"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Icon className="text-primary" size={48} weight="duotone" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">{type.title}</h3>
                  <p className="text-muted-foreground mb-6">{type.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-8 justify-center">
                    {type.examples.map((example) => (
                      <Badge key={example} variant="secondary" className="bg-muted/50 hover:bg-muted">
                        {example}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <ModeButton
                      title="Simple Mode"
                      subtitle="Quick creation"
                      icon={<Lightning size={20} />}
                      onClick={() => handleModeSelect('simple', type.id)}
                      variant="primary"
                    />
                    <ModeButton
                      title="Interactive Mode"
                      subtitle="Guided experience"
                      icon={<Sparkle size={20} />}
                      onClick={() => handleModeSelect('interactive', type.id)}
                      variant="secondary"
                    />
                  </div>
                </div>
              </ModernCard>
            )
          })}
        </motion.div>

        {/* Mode Explanations */}
        <motion.div 
          className="grid md:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <InfoCard
            title="Simple Mode"
            description="Quick and direct creation for users who know exactly what they want"
            features={[
              "Fill out forms with specific details",
              "Select from predefined characteristics", 
              "Fast creation process (under 2 minutes)",
              "Perfect for experienced users"
            ]}
            icon={<Lightning className="text-primary" size={24} weight="duotone" />}
            variant="primary"
            delay={0.1}
          />
          <InfoCard
            title="Interactive Mode"
            description="Guided experience with questions and scenarios to spark creativity"
            features={[
              "Step-by-step guided questions",
              "Visual choices and scenarios",
              "Great for discovering new ideas", 
              "Interactive and inspiring process"
            ]}
            icon={<Sparkle className="text-secondary" size={24} weight="duotone" />}
            variant="secondary"
            delay={0.2}
          />
        </motion.div>
      </div>
    </ModernLayout>
  )
}

function App() {
  return (
    <SessionProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AppContent />
      </ErrorBoundary>
    </SessionProvider>
  )
}

export default App