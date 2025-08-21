import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ErrorBoundary } from 'react-error-bo
import { Sparkle, Gear, DiceOne, ChatCircle, Users, Crown } from '@phosphor-icons/react'
import { ErrorBoundary } from 'react-error-boundary'
import { toast } from 'sonner'

function SafeErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
          
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="space-y
        <CardContent className="pt-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-muted-foreground mb-4">
            {error.message || 'An error occurred'}
          </p>
      </Card>
            <Button onClick={resetErrorBoundary} className="w-full">
              Try Again

            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Reload Page
            </Button>
          </div>
    console.error('Saf
      </Card>
  }
  )
 

    } catch (error) {

const SafeApp: React.FC = () => {
  const [mode, setMode] = useState<'home' | 'random' | 'custom' | 'girls' | 'settings'>('home')
  const [error, setError] = useState<string | null>(null)

          {/* Header */}
    console.error('Safe mode error:', error)
              <Spar
    toast.error(error)
   

              Safe mode is a
    try {
              🔞 18+ 
      setError(null)

      handleError('Failed to go back')
     
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
              </Ca
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Safe mode is active. Limited functionality available.
            </p>
                    className="w-full"
                    <DiceOne className=
                  
                

            </Card>

            <Card>
                <C
            

                  <Button className
                    Create Content
                  <Button variant="outline" onClick={handleBack} className="w-full">
                  </Button>
              </CardContent>
          )}
          {mode === 'girls' && (
              <CardHeader>
                <CardDescrip
              <Card

                      <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-2"></div>
                      <p className="text-sm text-mut
                    <div className="p-4 border rounded-
                      <h4 className="font-medium">Character 2</h4>
                    </div>
                  <Button className="w-full">
                    Generate
                  <

              </CardContent>
          )}
          {mode === 'settings' && (
              <CardHeader>
                <CardDescription>Configure basic options (Safe Mode)</CardDescription>
              <CardContent>
                  <div class
                   

                    Save Settings
                  <Button variant="outline" onClick={h
                  </Button>
              </CardContent>
          )}
      </div>
  )





















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