import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Brain, Eye, EyeClosed } from '@phosphor-icons/react'
import { aiService } from '@/lib/ai-service'
import { toast } from 'sonner'

interface ReasoningTestProps {
  onBack: () => void
}

export default function ReasoningTest({ onBack }: ReasoningTestProps) {
  const [prompt, setPrompt] = useState('Solve this step by step: If a train travels 60 mph and needs to go 180 miles, how long will it take?')
  const [response, setResponse] = useState('')
  const [hideReasoning, setHideReasoning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const testReasoning = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setIsLoading(true)
    setResponse('')

    try {
      const result = await aiService.generateText(prompt, {
        hideReasoning: hideReasoning,
        temperature: 0.3,
        maxTokens: 1000
      })
      
      setResponse(result)
      toast.success('Response generated successfully')
    } catch (error) {
      console.error('Reasoning test error:', error)
      toast.error('Failed to generate response')
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
            <Brain className="text-primary" size={32} weight="duotone" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reasoning Control Test</h1>
              <p className="text-muted-foreground">Test reasoning models with and without thinking tokens</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Input Section */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain size={20} />
                Test Prompt
              </CardTitle>
              <CardDescription>
                Enter a question or problem that requires reasoning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                className="min-h-[100px]"
              />
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hide-reasoning"
                  checked={hideReasoning}
                  onCheckedChange={(checked) => setHideReasoning(checked as boolean)}
                />
                <label htmlFor="hide-reasoning" className="flex items-center gap-2 text-sm font-medium">
                  {hideReasoning ? <EyeClosed size={16} /> : <Eye size={16} />}
                  Hide reasoning tokens (only show final answer)
                </label>
              </div>

              <Button
                onClick={testReasoning}
                disabled={isLoading || !prompt.trim()}
                className="w-full"
              >
                {isLoading ? 'Generating...' : 'Test Reasoning'}
              </Button>
            </CardContent>
          </Card>

          {/* Response Section */}
          <Card className="border-secondary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {hideReasoning ? <EyeClosed size={20} /> : <Eye size={20} />}
                Response
                {hideReasoning && <span className="text-sm text-muted-foreground">(Reasoning Hidden)</span>}
              </CardTitle>
              <CardDescription>
                {hideReasoning 
                  ? 'Only the final answer will be shown' 
                  : 'Full response including reasoning process'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {response ? (
                <div className="bg-muted/30 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                    {response}
                  </pre>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-lg p-4 text-center text-muted-foreground">
                  {isLoading ? 'Generating response...' : 'No response yet. Click "Test Reasoning" to start.'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Information */}
          <Card className="border-accent/30 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-accent">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Reasoning Models (like DeepSeek R1):</h4>
                <ul className="space-y-1 text-muted-foreground ml-4">
                  <li>• Generate internal "thinking" tokens during problem-solving</li>
                  <li>• Show their step-by-step reasoning process by default</li>
                  <li>• Can hide reasoning tokens to only show final answers</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Venice AI Implementation:</h4>
                <ul className="space-y-1 text-muted-foreground ml-4">
                  <li>• Use <code className="bg-muted px-1 rounded">hide_reasoning: true</code> to suppress thinking tokens</li>
                  <li>• Use <code className="bg-muted px-1 rounded">hide_reasoning: false</code> to show full reasoning</li>
                  <li>• Only applies to reasoning models like deepseek-r1-671b</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}