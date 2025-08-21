import React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sparkle, Gear, DiceOne, ChatCircle, Users, Crown } from '@phosphor-icons/react'
import { ErrorBoundary } from 'react-error-boundary'
import { toast } from 'sonner'

// Safe error fallback
function SafeErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md">
        <CardContent className="pt-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error.message || 'An error occurred'}
          </p>
          <div className="space-y-2">
            <Button onClick={resetErrorBoundary} variant="outline" className="w-full">
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

type CreationType = 'character' | 'scenario'

const SafeApp: React.FC = () => {
  const [mode, setMode] = useState<'home' | 'random' | 'custom' | 'girls' | 'settings'>('home')
  const [error, setError] = useState<string | null>(null)

  const handleError = (error: string) => {
    console.error('Safe mode error:', error)
    setError(error)
    toast.error(error)
  }

  const handleBack = () => {
    try {
      setMode('home')
      setError(null)
    } catch (error) {
      handleError('Failed to go back')
    }
  }

  return (
    <ErrorBoundary FallbackComponent={SafeErrorFallback}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkle className="text-primary" size={40} weight="fill" />
              <h1 className="text-4xl font-bold text-foreground">
                NSFW AI Generator
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Safe mode is active. Limited functionality available.
            </p>
            <div className="mt-4 text-sm text-accent font-medium">
              🔞 18+ Adult Content Only
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-center">{error}</p>
            </div>
          )}

          {/* Safe Mode Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer group"
                  onClick={() => setMode('random')}>
              <CardContent className="p-6 text-center">
                <DiceOne className="mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" size={32} weight="duotone" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Random Content</h3>
                <p className="text-sm text-muted-foreground">Basic random generation</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30 hover:shadow-lg hover:shadow-secondary/10 transition-all cursor-pointer group"
                  onClick={() => setMode('custom')}>
              <CardContent className="p-6 text-center">
                <ChatCircle className="mx-auto mb-3 text-secondary group-hover:scale-110 transition-transform" size={32} weight="duotone" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Basic Builder</h3>
                <p className="text-sm text-muted-foreground">Simple content creation</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30 hover:shadow-lg hover:shadow-accent/10 transition-all cursor-pointer group"
                  onClick={() => setMode('girls')}>
              <CardContent className="p-6 text-center">
                <Users className="mx-auto mb-3 text-accent group-hover:scale-110 transition-transform" size={32} weight="duotone" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Character Gen</h3>
                <p className="text-sm text-muted-foreground">Basic character creation</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-muted/20 to-muted/5 border-muted/30 hover:shadow-lg hover:shadow-muted/10 transition-all cursor-pointer group"
                  onClick={() => setMode('settings')}>
              <CardContent className="p-6 text-center">
                <Gear className="mx-auto mb-3 text-muted-foreground group-hover:scale-110 transition-transform" size={32} weight="duotone" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Settings</h3>
                <p className="text-sm text-muted-foreground">Basic configuration</p>
              </CardContent>
            </Card>
          </div>

          {/* Current Mode Content */}
          {mode === 'random' && (
            <Card>
              <CardHeader>
                <CardTitle>Random Content Generator</CardTitle>
                <CardDescription>Generate random NSFW content (Safe Mode)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    onClick={() => {
                      try {
                        // Basic random generation logic would go here
                        toast.success('Random content generated!')
                      } catch (error) {
                        handleError('Failed to generate content')
                      }
                    }}
                    className="w-full"
                  >
                    <DiceOne className="mr-2" size={16} />
                    Generate Random
                  </Button>
                  <Button variant="outline" onClick={handleBack} className="w-full">
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {mode === 'custom' && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Builder</CardTitle>
                <CardDescription>Create custom content (Safe Mode)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input placeholder="Enter your idea..." />
                  <Button className="w-full">
                    <ChatCircle className="mr-2" size={16} />
                    Create Content
                  </Button>
                  <Button variant="outline" onClick={handleBack} className="w-full">
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {mode === 'girls' && (
            <Card>
              <CardHeader>
                <CardTitle>Character Generator</CardTitle>
                <CardDescription>Generate female characters (Safe Mode)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-2"></div>
                      <h4 className="font-medium">Character 1</h4>
                      <p className="text-sm text-muted-foreground">Basic character</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-2"></div>
                      <h4 className="font-medium">Character 2</h4>
                      <p className="text-sm text-muted-foreground">Basic character</p>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Users className="mr-2" size={16} />
                    Generate More
                  </Button>
                  <Button variant="outline" onClick={handleBack} className="w-full">
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {mode === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Settings</CardTitle>
                <CardDescription>Configure basic options (Safe Mode)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <Input type="password" placeholder="Enter API key..." />
                  </div>
                  <Button className="w-full">
                    <Gear className="mr-2" size={16} />
                    Save Settings
                  </Button>
                  <Button variant="outline" onClick={handleBack} className="w-full">
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default SafeApp