import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Sparkle, Image as ImageIcon } from '@phosphor-icons/react'
import { aiService } from '@/lib/ai-service'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import type { ApiConfig } from './ApiSettings'

interface ImageGenerationTestProps {
  onBack: () => void
}

export default function ImageGenerationTest({ onBack }: ImageGenerationTestProps) {
  const [prompt, setPrompt] = useState('Beautiful woman with long brown hair')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [apiConfig] = useKV<ApiConfig>('api-config', {
    apiKey: '',
    textModel: 'default',
    imageModel: 'venice-sd35'
  })

  const testImageGeneration = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    setGeneratedImage(null)

    try {
      console.log('Testing image generation with prompt:', prompt)
      console.log('Current API config:', {
        hasKey: !!apiConfig?.apiKey,
        textModel: apiConfig?.textModel,
        imageModel: apiConfig?.imageModel
      })

      const imageUrl = await aiService.generateImage(prompt, {
        width: 512,
        height: 512,
        style: 'photorealistic, high quality, detailed'
      })

      console.log('Generated image URL type:', typeof imageUrl)
      console.log('Generated image URL length:', imageUrl.length)
      console.log('Generated image URL preview:', imageUrl.substring(0, 100))

      setGeneratedImage(imageUrl)
      
      if (imageUrl.includes('data:image/svg')) {
        toast.warning('Venice AI unavailable - showing SVG placeholder')
      } else {
        toast.success('Image generated successfully!')
      }
    } catch (error) {
      console.error('Image generation test failed:', error)
      toast.error(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    setIsGenerating(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="hover:bg-primary/10"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <ImageIcon className="text-primary" size={32} weight="duotone" />
            <h1 className="text-3xl font-bold text-foreground">
              Venice AI Image Generation Test
            </h1>
          </div>
        </div>

        {/* API Status */}
        <Card className="mb-6 border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkle className="text-primary" size={20} />
              API Configuration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Text Model</Label>
                <div className="font-medium">{apiConfig?.textModel || 'Not configured'}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Image Model</Label>
                <div className="font-medium">{apiConfig?.imageModel || 'Not configured'}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">API Key</Label>
                <div className="font-medium">
                  {apiConfig?.apiKey ? '✓ Configured' : '✗ Missing'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Test Image Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="prompt">Image Prompt</Label>
              <Input
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter a description for the image..."
                className="text-base"
              />
            </div>

            <Button
              onClick={testImageGeneration}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                  Generating Image...
                </>
              ) : (
                <>
                  <ImageIcon size={20} className="mr-2" />
                  Generate Test Image
                </>
              )}
            </Button>

            {/* Image Display */}
            {generatedImage && (
              <Card className="border-2 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg">Generated Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                      style={{ maxHeight: '512px' }}
                      onLoad={() => console.log('Image loaded successfully')}
                      onError={(e) => {
                        console.error('Image failed to load:', e)
                        toast.error('Failed to display generated image')
                      }}
                    />
                    <div className="mt-4 text-sm text-muted-foreground">
                      <div className="font-medium">Image Details:</div>
                      <div>Type: {generatedImage.startsWith('data:image/svg') ? 'SVG Placeholder' : 'AI Generated'}</div>
                      <div>Size: {generatedImage.length.toLocaleString()} characters</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Debug Info */}
            <Card className="border-muted/30 bg-muted/20">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Debug Information</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <div>Venice AI Endpoint: https://api.venice.ai/api/v1/image/generate</div>
                <div>Expected Response: JSON with 'images' array or 'image' field</div>
                <div>Authentication: Bearer token with API key</div>
                <div>Check browser console for detailed logs</div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}