import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeSlash, Check, X, Key, Image, Chat } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

export interface ApiConfig {
  apiKey: string
  textModel: string
  imageModel: string
}

interface ApiSettingsProps {
  onClose: () => void
  onSave?: (config: ApiConfig) => void
}

// Venice AI text models (using correct model IDs)
const veniceTextModels = [
  { id: 'default', name: 'Venice Auto (Default)', description: 'Auto-selects best model' },
  { id: 'venice-uncensored', name: 'Venice Uncensored 1.1', description: 'Uncensored model' },
  { id: 'qwen-2.5-qwq-32b', name: 'Venice Reasoning', description: 'Reasoning focused' },
  { id: 'qwen3-4b', name: 'Venice Small', description: 'Fast and efficient' },
  { id: 'mistral-32-24b', name: 'Venice Medium (3.2 beta)', description: 'Balanced performance' },
  { id: 'mistral-31-24b', name: 'Venice Medium (3.1)', description: 'Stable performance' },
  { id: 'qwen3-235b', name: 'Venice Large 1.1', description: 'Highest quality' },
  { id: 'llama-3.2-3b', name: 'Llama 3.2 3B', description: 'Fast model' },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', description: 'Default option' },
  { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', description: 'Most intelligent' },
  { id: 'dolphin-2.9.2-qwen2-72b', name: 'Dolphin 72B', description: 'Most uncensored' },
  { id: 'qwen-2.5-vl', name: 'Qwen 2.5 VL 72B', description: 'Vision capable' },
  { id: 'qwen-2.5-coder-32b', name: 'Qwen 2.5 Coder 32B', description: 'Code focused' },
  { id: 'deepseek-r1-671b', name: 'DeepSeek R1 671B', description: 'Reasoning model' },
  { id: 'deepseek-coder-v2-lite', name: 'DeepSeek Coder V2 Lite', description: 'Lite coding model' }
]

// Venice AI image models (from their official API docs)
const veniceImageModels = [
  { id: 'venice-sd35', name: 'Venice SD35', description: 'Default stable diffusion model' },
  { id: 'flux-dev', name: 'Flux Dev', description: 'Highest quality images' },
  { id: 'hidream', name: 'HiDream', description: 'High detail generation' },
  { id: 'stable-diffusion-3.5', name: 'Stable Diffusion 3.5', description: 'Latest stable diffusion' }
]

export default function ApiSettings({ onClose, onSave }: ApiSettingsProps) {
  const [apiConfig, setApiConfig] = useKV<ApiConfig>('api-config', {
    apiKey: '',
    textModel: 'default',
    imageModel: 'venice-sd35'
  })

  const [showKey, setShowKey] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleApiKeyChange = (value: string) => {
    setApiConfig(prev => ({ 
      apiKey: value,
      textModel: prev?.textModel || 'default',
      imageModel: prev?.imageModel || 'venice-sd35'
    }))
    setConnectionStatus('idle')
  }

  const handleTextModelChange = (model: string) => {
    setApiConfig(prev => ({ 
      apiKey: prev?.apiKey || '',
      textModel: model,
      imageModel: prev?.imageModel || 'venice-sd35'
    }))
  }

  const handleImageModelChange = (model: string) => {
    setApiConfig(prev => ({ 
      apiKey: prev?.apiKey || '',
      textModel: prev?.textModel || 'default',
      imageModel: model
    }))
  }

  const testConnection = async () => {
    if (!apiConfig?.apiKey) {
      toast.error('Please enter your Venice AI API key')
      return
    }

    setTestingConnection(true)
    setConnectionStatus('idle')

    try {
      console.log('Testing Venice AI connection...')
      
      // Test text generation
      const textResponse = await fetch('https://api.venice.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: apiConfig.textModel,
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
          'Authorization': `Bearer ${apiConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: apiConfig.imageModel,
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
        setConnectionStatus('success')
        toast.success('Venice AI connection successful! (Text & Image)')
      } else {
        const imageError = await imageResponse.text()
        console.error('Venice AI image test failed:', imageError)
        setConnectionStatus('success') // Still mark success if text works
        toast.warning('Venice AI text works, but image generation may have issues')
      }
        
    } catch (error) {
      console.error('Connection test error:', error)
      setConnectionStatus('error')
      toast.error('Connection failed. Please check your API key and network.')
    }

    setTestingConnection(false)
  }

  const handleSave = () => {
    if (!apiConfig?.apiKey) {
      toast.error('Please enter your Venice AI API key')
      return
    }

    toast.success('Venice AI settings saved successfully!')
    onSave?.(apiConfig)
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
                Venice AI Configuration
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Configure Venice AI for text and image generation
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* API Key Section */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Key className="text-primary" size={24} />
                <div>
                  <h3 className="font-semibold">Venice AI API Key</h3>
                  <p className="text-sm text-muted-foreground">Your Venice AI API key for both text and image generation</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showKey ? 'text' : 'password'}
                    placeholder="Enter your Venice AI API key..."
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
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={testConnection}
                  disabled={testingConnection || !apiConfig?.apiKey}
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

          {/* Text Model Selection */}
          <Card className="border-2 border-secondary/20">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Chat className="text-secondary" size={24} />
                <div>
                  <h3 className="font-semibold">Text Generation Model</h3>
                  <p className="text-sm text-muted-foreground">Choose the Venice AI model for text generation</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="textModel">Text Model</Label>
                <Select value={apiConfig?.textModel || 'default'} onValueChange={handleTextModelChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a text model" />
                  </SelectTrigger>
                  <SelectContent>
                    {veniceTextModels.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col">
                          <span>{model.name}</span>
                          <span className="text-xs text-muted-foreground">{model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Image Model Selection */}
          <Card className="border-2 border-accent/20">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Image className="text-accent" size={24} />
                <div>
                  <h3 className="font-semibold">Image Generation Model</h3>
                  <p className="text-sm text-muted-foreground">Choose the Venice AI model for image generation</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageModel">Image Model</Label>
                <Select value={apiConfig?.imageModel || 'venice-sd35'} onValueChange={handleImageModelChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an image model" />
                  </SelectTrigger>
                  <SelectContent>
                    {veniceImageModels.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col">
                          <span>{model.name}</span>
                          <span className="text-xs text-muted-foreground">{model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-6 border-t border-border">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Settings
            </Button>
          </div>
        </CardContent>
      </div>
    </div>
  )
}