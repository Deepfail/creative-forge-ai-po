import React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useKV } from '@github/spark/hooks'

function SafeErrorFallback({ error, resetErrorBounda
    <div className="min-h-screen bg-backgro
import { toast } from 'sonner'

// Safe error fallback
function SafeErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md">
        <CardContent className="pt-6 text-center">
}
type AppMode = 'home' | 'simple' | 'interactive' | 'random' | 'custom' | 'g

  apiKey: string
  imageModel: string

  const [mode, setMod
  const [showSettings, setShowSettings] = useState(false)
  const [error, setError]
  // Initialize with 
    apiKey: '',
    imageModel: 'venic

    try {
   
 

type AppMode = 'home' | 'simple' | 'interactive' | 'random' | 'custom' | 'girls' | 'settings' | 'harem' | 'prompts' | 'prompts-test' | 'image-test' | 'prompts-debug'
type CreationType = 'character' | 'scenario'

interface ApiConfig {
  apiKey: string
  textModel: string
  imageModel: string
}

export default function SafeApp() {
  const [mode, setMode] = useState<AppMode>('home')
  const [selectedType, setSelectedType] = useState<CreationType>('character')
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize with safe defaults
  const [apiConfig, setApiConfig] = useKV<ApiConfig>('api-config', {
    apiKey: '',
    textModel: 'default',
    imageModel: 'venice-sd35'
  })

  useEffect(() => {
    try {
      // Basic initialization check
      if (typeof window !== 'undefined' && window.spark) {
        console.log('Spark runtime available')
        setIsLoading(false)
      } else {
        console.log('Waiting for Spark runtime...')
        const checkSpark = setInterval(() => {
          if (typeof window !== 'undefined' && window.spark) {
              </Button>
                Reload Page
            </div>
        </C
    )

  if (mode === 'home') {
      <ErrorBoundary Fallb
          <div className="container mx-auto px
            <div className="t
                <div className="fle
                
       
                </d
                  <Button
                    size="sm"
                    class
     
        

                Create amazing NSFW characters, scenarios, and interact
         
                🔞 18+ Adult Content 
            </div>
            {/* Quic
              <Card
                <CardContent className="p-6 text-
                  <h3 className="text-l
     


                  <ChatCircl
         
              </Card>
              <Card 
                <Ca
                  <h3 className="text-lg font
                </CardContent>

   

                  
            

            <C
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                  </p>
                    <Bad
               
            
     
   

            {s
            
                  <CardDescription>Configure your Venice AI API key and models</Car
                <CardContent classN
                    <label className="text-sm font-m
                      type="password"
                      onChange={(e) => setApiConfig(prev => ({ ...prev, apiKe
                    />
                  <div className="flex 
                      Save Settings
                    <Butt
                    </B
              <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Safe mode selector that only renders the home page initially
  if (mode === 'home') {
    return (
      <ErrorBoundary FallbackComponent={SafeErrorFallback}>
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
                    onClick={() => setShowSettings(true)}
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    <Gear size={16} className="mr-2" />
                    Settings
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
                    onClick={() => toast.info('Feature temporarily disabled for stability')}>
                <CardContent className="p-6 text-center">
                  <DiceOne className="mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" size={32} weight="duotone" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Random Scenario</h3>
                  <p className="text-sm text-muted-foreground">Get instant random NSFW scenarios</p>
                </CardContent>


              <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30 hover:shadow-lg hover:shadow-secondary/10 transition-all cursor-pointer group"
                    onClick={() => toast.info('Feature temporarily disabled for stability')}>
                <CardContent className="p-6 text-center">
                  <ChatCircle className="mx-auto mb-3 text-secondary group-hover:scale-110 transition-transform" size={32} weight="duotone" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Build Your Own</h3>
                  <p className="text-sm text-muted-foreground">Chat with AI to design custom content</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30 hover:shadow-lg hover:shadow-accent/10 transition-all cursor-pointer group"
                    onClick={() => toast.info('Feature temporarily disabled for stability')}>
                <CardContent className="p-6 text-center">
                  <Users className="mx-auto mb-3 text-accent group-hover:scale-110 transition-transform" size={32} weight="duotone" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Generate Girls</h3>
                  <p className="text-sm text-muted-foreground">Create random female characters</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-500/20 to-pink-500/5 border-pink-500/30 hover:shadow-lg hover:shadow-pink-500/10 transition-all cursor-pointer group"
                    onClick={() => toast.info('Feature temporarily disabled for stability')}>
                <CardContent className="p-6 text-center">
                  <Crown className="mx-auto mb-3 text-pink-500 group-hover:scale-110 transition-transform" size={32} weight="duotone" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">My Harem</h3>
                  <p className="text-sm text-muted-foreground">Manage your saved girls collection</p>
                </CardContent>
              </Card>
            </div>

            {/* Status Card */}
            <Card className="bg-muted/30 mb-8">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">System Status</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The application is running in safe mode to resolve stability issues.
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline" className="mr-2">
                      Runtime: {typeof window !== 'undefined' && window.spark ? 'Connected' : 'Disconnected'}
                    </Badge>
                    <Badge variant="outline" className="mr-2">
                      API: {apiConfig?.apiKey ? 'Configured' : 'Not Configured'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings Panel */}
            {showSettings && (
              <Card className="bg-card/95 backdrop-blur">
                <CardHeader>
                  <CardTitle>API Settings</CardTitle>
                  <CardDescription>Configure your Venice AI API key and models</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Venice AI API Key</label>
                    <Input
                      type="password"
                      value={apiConfig?.apiKey || ''}
                      onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Enter your Venice AI API key"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowSettings(false)}>
                      Save Settings
                    </Button>
                    <Button variant="outline" onClick={() => setShowSettings(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

        </div>

    )


  // For now, redirect any other mode back to home
  return (
    <ErrorBoundary FallbackComponent={SafeErrorFallback}>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Feature temporarily disabled</p>
            <Button onClick={handleBack}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>

}