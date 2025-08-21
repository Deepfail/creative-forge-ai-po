import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, TestTube, Sparkle } from '@phosphor-icons/react'
import { aiService } from '@/lib/ai-service'
import { toast } from 'sonner'

interface AITestComponentProps {
  onBack: () => void
}

export default function AITestComponent({ onBack }: AITestComponentProps) {
  const [testPrompt, setTestPrompt] = useState('Tell me a simple joke')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  const testAI = async () => {
    if (!testPrompt.trim()) {
      toast.error('Please enter a test prompt')
      return
    }

    setIsLoading(true)
    setResult('')
    setError('')

    try {
      console.log('Testing AI with prompt:', testPrompt)
      
      // Test different methods
      const sparkAvailable = !!(window as any).spark
      const sparkLlmAvailable = !!(window as any).spark?.llm
      const sparkLlmPromptAvailable = !!(window as any).spark?.llmPrompt
      
      console.log('Spark availability:', {
        sparkAvailable,
        sparkLlmAvailable,
        sparkLlmPromptAvailable
      })

      // Test direct spark method first
      if (sparkAvailable && sparkLlmAvailable && sparkLlmPromptAvailable) {
        console.log('Testing direct spark method...')
        try {
          const directPrompt = (window as any).spark.llmPrompt`${testPrompt}`
          const directResult = await (window as any).spark.llm(directPrompt)
          console.log('Direct spark result:', directResult)
          setResult(`Direct Spark Result:\n${directResult}\n\n`)
        } catch (directError) {
          console.error('Direct spark failed:', directError)
          setError(`Direct Spark Error: ${directError}\n\n`)
        }
      } else {
        setError('Spark not available: ' + JSON.stringify({
          sparkAvailable,
          sparkLlmAvailable,
          sparkLlmPromptAvailable
        }) + '\n\n')
      }

      // Test through AI service
      console.log('Testing AI service...')
      const serviceResult = await aiService.generateText(testPrompt)
      console.log('AI service result:', serviceResult)
      setResult(prev => prev + `AI Service Result:\n${serviceResult}`)
      
      toast.success('AI test completed successfully')
    } catch (serviceError) {
      console.error('AI service failed:', serviceError)
      const errorMsg = serviceError instanceof Error ? serviceError.message : String(serviceError)
      setError(prev => prev + `AI Service Error: ${errorMsg}`)
      toast.error('AI test failed: ' + errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="border-primary/30 hover:bg-primary/10"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <TestTube className="text-primary" size={32} weight="fill" />
            <h1 className="text-3xl font-bold text-foreground">
              AI Service Test
            </h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkle size={20} className="text-secondary" />
              Test AI Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-prompt">Test Prompt</Label>
              <Input
                id="test-prompt"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Enter a test prompt..."
              />
            </div>

            <Button 
              onClick={testAI} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Sparkle size={16} className="mr-2 animate-spin" />
                  Testing AI...
                </>
              ) : (
                <>
                  <TestTube size={16} className="mr-2" />
                  Test AI
                </>
              )}
            </Button>

            {error && (
              <div>
                <Label>Errors</Label>
                <Textarea
                  value={error}
                  readOnly
                  className="bg-destructive/10 border-destructive/30 text-destructive"
                  rows={6}
                />
              </div>
            )}

            {result && (
              <div>
                <Label>Results</Label>
                <Textarea
                  value={result}
                  readOnly
                  className="bg-success/10 border-success/30"
                  rows={10}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}