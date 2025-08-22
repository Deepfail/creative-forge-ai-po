import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit3, Save, X, Plus, Trash2 } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { usePrompts, type ChatPrompt, defaultPrompts } from '@/lib/prompts'
import { toast } from 'sonner'

interface PromptsManagerProps {
  onBack: () => void
}

export default function PromptsManager({ onBack }: PromptsManagerProps) {
  const { prompts, sortedPrompts, updatePrompt, addPrompt, deletePrompt, setPrompts, forceClear, initializePrompts } = usePrompts()
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null)
  const [newPrompt, setNewPrompt] = useState<Partial<ChatPrompt>>({
    id: '',
    name: '',
    description: '',
    greeting: '',
    style: '',
    systemPrompt: ''
  })
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Clear all prompts
  const clearAllPrompts = () => {
    forceClear()
    setRefreshKey(prev => prev + 1)
    toast.success('All prompts cleared')
  }

  // Manual refresh
  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1)
    toast.success('Prompts refreshed')
  }

  // Test function to create a sample prompt
  const createTestPrompt = () => {
    const testPrompt = {
      id: 'test-' + Date.now(),
      name: 'Test Character',
      description: 'A test character for debugging',
      greeting: 'Hello! This is a test prompt.',
      style: 'friendly',
      systemPrompt: 'You are a helpful test character. Always be friendly and helpful.'
    }
    addPrompt(testPrompt)
    toast.success('Test prompt created!')
  }

  // Initialize with defaults if needed
  const initializeDefaults = () => {
    console.log('Force initializing default prompts...')
    // Force update the Ali prompt
    const aliPrompt = defaultPrompts['luna-chat-builder']
    if (aliPrompt) {
      updatePrompt('luna-chat-builder', aliPrompt)
      console.log('Updated Ali prompt specifically')
    }
    initializePrompts()
    setRefreshKey(prev => prev + 1)
    toast.success('All default prompts initialized! Ali prompt updated.')
  }

  // Load all comprehensive prompts 
  const loadComprehensivePrompts = () => {
    console.log('Loading comprehensive prompt set...')
    // Clear existing first
    forceClear()
    setTimeout(() => {
      setPrompts(defaultPrompts)
      setRefreshKey(prev => prev + 1)
      toast.success(`${Object.keys(defaultPrompts).length} prompts loaded successfully!`)
    }, 100)
  }

  const handleSave = (promptId: string, updates: Partial<ChatPrompt>) => {
    try {
      console.log('PromptsManager: Saving prompt', promptId, 'with updates:', updates)
      updatePrompt(promptId, updates)
      setEditingPrompt(null)
      toast.success('Prompt updated successfully!')
      console.log('PromptsManager: Prompt saved successfully')
    } catch (error) {
      console.error('PromptsManager: Error saving prompt:', error)
      toast.error('Failed to save prompt: ' + error.message)
    }
  }

  const handleCreate = () => {
    if (!newPrompt.id || !newPrompt.name || !newPrompt.systemPrompt) {
      toast.error('Please fill in all required fields')
      return
    }

    // Check if ID already exists
    if (prompts && prompts[newPrompt.id]) {
      toast.error('A prompt with this ID already exists')
      return
    }

    addPrompt(newPrompt as Omit<ChatPrompt, 'updatedAt'>)
    setNewPrompt({
      id: '',
      name: '',
      description: '',
      greeting: '',
      style: '',
      systemPrompt: ''
    })
    setShowCreateDialog(false)
    toast.success('Prompt created successfully!')
  }

  const handleDelete = (promptId: string) => {
    deletePrompt(promptId)
    toast.success('Prompt deleted successfully!')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Prompts Manager</h1>
            <p className="text-muted-foreground">
              Manage all AI personality prompts and system instructions used throughout the application.
              Load the complete prompt set to access all available generators and assistants.
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus size={16} className="mr-2" />
                Create Prompt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Prompt</DialogTitle>
                <DialogDescription>
                  Create a new AI personality prompt for chat interactions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">ID (unique)</label>
                    <Input
                      value={newPrompt.id || ''}
                      onChange={(e) => setNewPrompt(prev => ({ ...prev, id: e.target.value }))}
                      placeholder="e.g. my-character"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name</label>
                    <Input
                      value={newPrompt.name || ''}
                      onChange={(e) => setNewPrompt(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Sarah - Flirty Assistant"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Input
                    value={newPrompt.description || ''}
                    onChange={(e) => setNewPrompt(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the character"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Style</label>
                  <Input
                    value={newPrompt.style || ''}
                    onChange={(e) => setNewPrompt(prev => ({ ...prev, style: e.target.value }))}
                    placeholder="e.g. seductive, playful, professional"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Greeting Message</label>
                  <Textarea
                    value={newPrompt.greeting || ''}
                    onChange={(e) => setNewPrompt(prev => ({ ...prev, greeting: e.target.value }))}
                    placeholder="Initial message the AI will send"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">System Prompt *</label>
                  <Textarea
                    value={newPrompt.systemPrompt || ''}
                    onChange={(e) => setNewPrompt(prev => ({ ...prev, systemPrompt: e.target.value }))}
                    placeholder="Detailed instructions for the AI behavior and personality"
                    rows={8}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreate} className="flex-1">
                    Create Prompt
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 items-center">
                <Button 
                  onClick={loadComprehensivePrompts}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  ⭐ Load All Prompts ({Object.keys(defaultPrompts).length})
                </Button>
                <Button 
                  onClick={() => {
                    console.log('Force updating Ali prompt...')
                    const aliPrompt = defaultPrompts['luna-chat-builder']
                    if (aliPrompt) {
                      updatePrompt('luna-chat-builder', aliPrompt)
                      console.log('Ali prompt updated with latest version')
                      toast.success('Ali prompt updated to latest version!')
                    } else {
                      toast.error('Ali prompt not found in defaults')
                    }
                  }}
                  size="sm"
                  className="bg-secondary hover:bg-secondary/90"
                >
                  🔄 Update Ali
                </Button>
                <Button 
                  onClick={initializeDefaults}
                  size="sm"
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/10"
                >
                  📝 Reset to Defaults
                </Button>
                <Button 
                  onClick={clearAllPrompts}
                  size="sm"
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  🗑️ Clear All
                </Button>
                <Button 
                  onClick={forceRefresh}
                  size="sm"
                  variant="outline"
                >
                  🔄 Refresh
                </Button>
                <Button 
                  onClick={createTestPrompt}
                  size="sm"
                  variant="outline"
                  className="bg-accent/20"
                >
                  🧪 Test Prompt
                </Button>
                <span className="text-sm text-muted-foreground ml-4">
                  Loaded: {sortedPrompts.length} / Available: {Object.keys(defaultPrompts).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Section */}
        <div className="mb-6">
          <Card className="bg-muted/20">
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Debug Info:</div>
                <div>Prompts object exists: {prompts !== null ? 'Yes' : 'No'}</div>
                <div>Prompts keys: {prompts ? Object.keys(prompts).join(', ') || 'empty' : 'null'}</div>
                <div>Sorted prompts count: {sortedPrompts.length}</div>
                <div>Refresh key: {refreshKey}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prompts List */}
        <div className="space-y-6" key={refreshKey}>
          {sortedPrompts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">No Prompts Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Your prompts collection is empty. Load the comprehensive prompt set to get started.
                  </p>
                  <div className="flex flex-col gap-2 items-center">
                    <Button 
                      onClick={loadComprehensivePrompts}
                      className="bg-primary hover:bg-primary/90"
                    >
                      ⭐ Load All Prompts ({Object.keys(defaultPrompts).length})
                    </Button>
                    <Button 
                      onClick={() => setShowCreateDialog(true)}
                      size="sm"
                      variant="outline"
                    >
                      Create Custom Prompt
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Group prompts by style for better organization
            (() => {
              const groupedPrompts = sortedPrompts.reduce((acc, prompt) => {
                const style = prompt.style || 'misc'
                if (!acc[style]) acc[style] = []
                acc[style].push(prompt)
                return acc
              }, {} as Record<string, typeof sortedPrompts>)

              return Object.entries(groupedPrompts).map(([style, prompts]) => (
                <Card key={style} className="mb-6">
                  <CardHeader>
                    <CardTitle className="capitalize text-lg text-primary">
                      {style === 'misc' ? 'Miscellaneous' : style} Prompts ({prompts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {prompts.map((prompt) => (
                      <Card key={prompt.id} className="relative border-border/50">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {prompt.name}
                                <Badge variant="secondary">{prompt.id}</Badge>
                              </CardTitle>
                              {prompt.description && <CardDescription>{prompt.description}</CardDescription>}
                              {prompt.style && (
                                <Badge variant="outline" className="mt-2">
                                  {prompt.style}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingPrompt(editingPrompt === prompt.id ? null : prompt.id)}
                              >
                                {editingPrompt === prompt.id ? (
                                  <X size={16} />
                                ) : (
                                  <Edit3 size={16} />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(prompt.id)}
                                className="border-destructive text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        
                        {editingPrompt === prompt.id ? (
                          <CardContent>
                            <PromptEditor
                              prompt={prompt}
                              onSave={(updates) => handleSave(prompt.id, updates)}
                              onCancel={() => setEditingPrompt(null)}
                            />
                          </CardContent>
                        ) : (
                          <CardContent>
                            <div className="space-y-4">
                              {prompt.greeting && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Greeting</h4>
                                  <div className="bg-muted p-3 rounded-lg">
                                    <p className="text-sm whitespace-pre-wrap line-clamp-3">
                                      {prompt.greeting}
                                    </p>
                                  </div>
                                </div>
                              )}
                              <div>
                                <h4 className="text-sm font-medium mb-2">System Prompt</h4>
                                <div className="bg-muted p-3 rounded-lg">
                                  <p className="text-xs text-muted-foreground line-clamp-4">
                                    {prompt.systemPrompt}
                                  </p>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Last updated: {new Date(prompt.updatedAt).toLocaleString()}
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              ))
            })()
          )}
        </div>
      </div>
    </div>
  )
}

interface PromptEditorProps {
  prompt: ChatPrompt
  onSave: (updates: Partial<ChatPrompt>) => void
  onCancel: () => void
}

function PromptEditor({ prompt, onSave, onCancel }: PromptEditorProps) {
  const [editedPrompt, setEditedPrompt] = useState<ChatPrompt>(prompt)

  const handleSave = () => {
    onSave(editedPrompt)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Name</label>
          <Input
            value={editedPrompt.name}
            onChange={(e) => setEditedPrompt(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Style</label>
          <Input
            value={editedPrompt.style || ''}
            onChange={(e) => setEditedPrompt(prev => ({ ...prev, style: e.target.value }))}
          />
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Description</label>
        <Input
          value={editedPrompt.description || ''}
          onChange={(e) => setEditedPrompt(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Greeting Message</label>
        <Textarea
          value={editedPrompt.greeting || ''}
          onChange={(e) => setEditedPrompt(prev => ({ ...prev, greeting: e.target.value }))}
          rows={4}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">System Prompt</label>
        <Textarea
          value={editedPrompt.systemPrompt}
          onChange={(e) => setEditedPrompt(prev => ({ ...prev, systemPrompt: e.target.value }))}
          rows={12}
        />
      </div>
      
      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1">
          <Save size={16} className="mr-2" />
          Save Changes
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}