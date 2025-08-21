import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from '@phosphor-icons/react'
import { usePrompts } from '@/lib/prompts'
import { toast } from 'sonner'

interface PromptsTestProps {
  onBack: () => void
}

export default function PromptsTest({ onBack }: PromptsTestProps) {
  const { prompts, sortedPrompts, setPrompts } = usePrompts()

  const testPrompts = () => {
    console.log('=== PROMPTS TEST ===')
    console.log('prompts object:', prompts)
    console.log('prompts type:', typeof prompts)
    console.log('prompts keys:', prompts ? Object.keys(prompts) : 'null')
    console.log('sortedPrompts:', sortedPrompts)
    console.log('sortedPrompts length:', sortedPrompts.length)
    
    toast.info(`Found ${sortedPrompts.length} prompts. Check console for details.`)
  }

  const clearStorage = async () => {
    try {
      await spark.kv.delete('chat-prompts')
      toast.success('Storage cleared')
    } catch (error) {
      console.error('Clear storage error:', error)
      toast.error('Failed to clear storage')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Prompts Test</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button onClick={testPrompts} variant="outline">
                  Test Prompts
                </Button>
                <Button onClick={clearStorage} variant="destructive">
                  Clear Storage
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>Prompts object type: {typeof prompts}</p>
                <p>Prompts exists: {prompts ? 'Yes' : 'No'}</p>
                <p>Prompts keys: {prompts ? Object.keys(prompts).join(', ') : 'None'}</p>
                <p>Sorted prompts length: {sortedPrompts.length}</p>
              </div>
            </CardContent>
          </Card>

          {sortedPrompts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Prompts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedPrompts.map((prompt) => (
                    <div key={prompt.id} className="border rounded p-4">
                      <h3 className="font-semibold">{prompt.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {prompt.id}</p>
                      {prompt.description && (
                        <p className="text-sm mt-1">{prompt.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}