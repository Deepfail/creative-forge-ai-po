import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, EyeSlash, Check, X, Key, Globe, Sparkle } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

export type ApiProvider = 'openrouter' | 'venice' | 'internal'

export interface ApiConfig {
  provider: ApiProvider
  apiKey: string
  baseUrl?: string
  model?: string
}

interface ApiSettingsProps {
  onClose: () => void
  onSave?: (config: ApiConfig) => void
}

const apiProviders = [
  {
    id: 'internal' as ApiProvider,
    name: 'Internal AI (Default)',
    description: 'Built-in AI generation - no setup required',
    baseUrl: '',
    models: ['gpt-4o', 'gpt-4o-mini'],
    requiresKey: false,
    icon: Sparkle
  },
  {
    id: 'openrouter' as ApiProvider,
    name: 'OpenRouter',
    description: 'Access multiple AI models through OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: [
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3-haiku',
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'meta-llama/llama-3.1-405b-instruct',
      'google/gemini-pro-1.5',
      'mistralai/mixtral-8x7b-instruct'
    ],
    requiresKey: true,
    icon: Globe
  },
  {
    id: 'venice' as ApiProvider,
    name: 'Venice.ai',
    description: 'Uncensored AI models for adult content',
    baseUrl: 'https://api.venice.ai/api/v1',
    models: [
      'default',
      'venice-uncensored',
      'qwen-2.5-qwq-32b', 
      'qwen3-4b',
      'mistral-32-24b',
      'mistral-31-24b',
      'qwen3-235b',
      'llama-3.2-3b',
      'llama-3.3-70b',
      'llama-3.1-405b',
      'dolphin-2.9.2-qwen2-72b',
      'qwen-2.5-vl',
      'qwen-2.5-coder-32b',
      'deepseek-r1-671b',
      'deepseek-coder-v2-lite'
    ],
    requiresKey: true,
    icon: Key
  }
]

export default function ApiSettings({ onClose, onSave }: ApiSettingsProps) {
  const [apiConfig, setApiConfig] = useKV<ApiConfig>('api-config', {
    provider: 'venice',
    apiKey: '',
    model: 'default'
  })

  const [showKey, setShowKey] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const selectedProvider = apiProviders.find(p => p.id === apiConfig?.provider)

  const handleProviderChange = (providerId: ApiProvider) => {
    const provider = apiProviders.find(p => p.id === providerId)
    if (!provider) return

    setApiConfig({
      provider: providerId,
      apiKey: providerId === 'internal' ? '' : apiConfig?.apiKey || '',
      baseUrl: provider.baseUrl,
      model: provider.models[0]
    })
    setConnectionStatus('idle')
  }

  const handleApiKeyChange = (value: string) => {
    setApiConfig(prev => ({ 
      provider: prev?.provider || 'venice',
      apiKey: value,
      baseUrl: prev?.baseUrl,
      model: prev?.model || 'default'
    }))
    setConnectionStatus('idle')
  }

  const handleModelChange = (model: string) => {
    setApiConfig(prev => ({ 
      provider: prev?.provider || 'venice',
      apiKey: prev?.apiKey || '',
      baseUrl: prev?.baseUrl,
      model 
    }))
  }

  const testConnection = async () => {
    if (!selectedProvider || (selectedProvider.requiresKey && !apiConfig?.apiKey)) {
      toast.error('Please enter an API key')
      return
    }

    setTestingConnection(true)
    setConnectionStatus('idle')

    try {
      // For internal provider, just mark as success since it uses the built-in spark.llm
      if (apiConfig?.provider === 'internal') {
        setConnectionStatus('success')
        toast.success('Internal AI is ready to use')
        setTestingConnection(false)
        return
      }

      // For Venice AI, test both text and image generation
      if (apiConfig?.provider === 'venice') {
        console.log('Testing Venice AI connection...')
        
        // Test text generation first
        const textResponse = await fetch(`${apiConfig?.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiConfig?.apiKey}`,
          },
          body: JSON.stringify({
            model: apiConfig?.model || 'default',
            messages: [{ role: 'user', content: 'Hello, please respond with just "OK" to test the connection.' }],
            max_tokens: 10,
            temperature: 0.1
          })
        })

        if (!textResponse.ok) {
          const error = await textResponse.text()
          console.error('Venice AI text test failed:', error)
          throw new Error(`Text API failed: ${textResponse.status}`)
        }

        // Test image generation
        const imageResponse = await fetch('https://api.venice.ai/api/v1/image/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiConfig?.apiKey}`,
          },
          body: JSON.stringify({
            prompt: 'test portrait',
            width: 256,
            height: 256,
            num_inference_steps: 10,
            guidance_scale: 5,
            scheduler: "euler_a"
          })
        })

        console.log('Venice AI image test response:', imageResponse.status)
        
        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          console.log('Venice AI image test response data:', Object.keys(imageData))
          setConnectionStatus('success')
          toast.success('Venice AI connection successful! (Text & Image)')
        } else {
          const imageError = await imageResponse.text()
          console.error('Venice AI image test failed:', imageError)
          setConnectionStatus('success') // Still mark success if text works
          toast.warning('Venice AI text works, but image generation may have issues')
        }
        
        setTestingConnection(false)
        return
      }

      // Test other external API connections
      const testPrompt = 'Hello, please respond with just "OK" to test the connection.'
      
      const response = await fetch(`${apiConfig?.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig?.apiKey}`,
          ...(apiConfig?.provider === 'openrouter' && {
            'HTTP-Referer': window.location.origin,
            'X-Title': 'AI Adult Creative Generator'
          })
        },
        body: JSON.stringify({
          model: apiConfig?.model,
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 10,
          temperature: 0.1
        })
      })

      if (response.ok) {
        setConnectionStatus('success')
        toast.success('Connection successful!')
      } else {
        const error = await response.text()
        console.error('API test failed:', error)
        setConnectionStatus('error')
        toast.error('Connection failed. Please check your API key and settings.')
      }
    } catch (error) {
      console.error('Connection test error:', error)
      setConnectionStatus('error')
      toast.error('Connection failed. Please check your network and settings.')
    }

    setTestingConnection(false)
  }

  const handleSave = () => {
    if (selectedProvider?.requiresKey && !apiConfig?.apiKey) {
      toast.error('Please enter an API key for the selected provider')
      return
    }

    toast.success('API settings saved successfully!')
    onSave?.(apiConfig!)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Key className="text-primary" size={24} />
                API Configuration
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Configure your AI provider for character and scenario generation
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={apiConfig?.provider || 'venice'} onValueChange={handleProviderChange}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              {apiProviders.map(provider => {
                const Icon = provider.icon
                return (
                  <TabsTrigger key={provider.id} value={provider.id} className="flex items-center gap-2">
                    <Icon size={16} />
                    {provider.name}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {apiProviders.map(provider => (
              <TabsContent key={provider.id} value={provider.id} className="space-y-6">
                <Card className="border-2 border-primary/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <provider.icon className="text-primary" size={24} />
                      <div>
                        <h3 className="font-semibold">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                      </div>
                      {!provider.requiresKey && (
                        <Badge variant="secondary" className="ml-auto">
                          Free
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {provider.requiresKey && (
                      <div className="space-y-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <div className="relative">
                          <Input
                            id="apiKey"
                            type={showKey ? 'text' : 'password'}
                            placeholder="Enter your API key..."
                            value={apiConfig?.apiKey || ''}
                            onChange={(e) => handleApiKeyChange(e.target.value)}
                            className="pr-12"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowKey(!showKey)}
                          >
                            {showKey ? <EyeSlash size={16} /> : <Eye size={16} />}
                          </Button>
                        </div>
                        {provider.id === 'openrouter' && (
                          <p className="text-xs text-muted-foreground">
                            Get your API key from{' '}
                            <a 
                              href="https://openrouter.ai/keys" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              openrouter.ai/keys
                            </a>
                          </p>
                        )}
                        {provider.id === 'venice' && (
                          <p className="text-xs text-muted-foreground">
                            Get your API key from{' '}
                            <a 
                              href="https://venice.ai/api" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              venice.ai/api
                            </a>
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Select value={apiConfig?.model || 'default'} onValueChange={handleModelChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          {provider.models.map(model => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {provider.baseUrl && (
                      <div className="space-y-2">
                        <Label>Base URL</Label>
                        <Input value={provider.baseUrl} disabled className="text-muted-foreground" />
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        onClick={testConnection}
                        disabled={testingConnection || (provider.requiresKey && !apiConfig?.apiKey)}
                        variant="outline"
                        size="sm"
                      >
                        {testingConnection ? 'Testing...' : 'Test Connection'}
                      </Button>
                      
                      {connectionStatus === 'success' && (
                        <div className="flex items-center gap-2 text-success text-sm">
                          <Check size={16} />
                          Connection successful
                        </div>
                      )}
                      
                      {connectionStatus === 'error' && (
                        <div className="flex items-center gap-2 text-destructive text-sm">
                          <X size={16} />
                          Connection failed
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex gap-3 pt-6 border-t border-border">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Settings
            </Button>
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkle size={14} className="text-primary" />
              <span className="font-medium">Image Generation</span>
            </div>
            <p>Image generation always attempts to use Venice AI when available, regardless of your text generation provider choice. Configure Venice AI here to enable AI-generated portraits. When Venice AI is unavailable, enhanced artistic placeholders are used instead.</p>
          </div>
        </CardContent>
      </div>
    </div>
  )
}