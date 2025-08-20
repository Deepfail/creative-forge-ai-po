import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit3, Save, X, Plus, Trash2 } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { usePrompts, type ChatPrompt } from '@/lib/prompts'
import { toast } from 'sonner'

interface PromptsManagerProps {
  onBack: () => void
}

export default function PromptsManager({ onBack }: PromptsManagerProps) {
  const { prompts, sortedPrompts, updatePrompt, addPrompt, deletePrompt } = usePrompts()
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

  const handleSave = (promptId: string, updates: Partial<ChatPrompt>) => {
    updatePrompt(promptId, updates)
    setEditingPrompt(null)
    toast.success('Prompt updated successfully!')
  }

  const handleCreate = () => {
    if (!newPrompt.id || !newPrompt.name || !newPrompt.systemPrompt) {
      toast.error('Please fill in all required fields')
      return
    }

    // Check if ID already exists
    if (prompts[newPrompt.id]) {
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
    if (promptId === 'luna') {
      toast.error('Cannot delete the default Luna prompt')
      return
    }
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
            <p className="text-muted-foreground">Manage AI personality prompts and responses</p>
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

        {/* Prompts List */}
        <div className="space-y-6">
          {sortedPrompts.map((prompt) => (
            <Card key={prompt.id} className="relative">
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
                    {prompt.id !== 'luna' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(prompt.id)}
                        className="border-destructive text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
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