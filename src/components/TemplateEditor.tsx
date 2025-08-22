import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Plus, Trash2, ArrowLeft, Save } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface TemplateVariable {
  id: string
  name: string
  description: string
  defaultValue: string
  category: 'character' | 'physical' | 'personality' | 'scenario' | 'custom'
}

interface TemplatePattern {
  id: string
  name: string
  description: string
  template: string
  variables: string[]
  category: 'character' | 'scenario' | 'image' | 'export'
}

interface TemplateEditorProps {
  onBack: () => void
}

// Default template variables
const defaultVariables: Record<string, TemplateVariable> = {
  'name': {
    id: 'name',
    name: 'name',
    description: 'Character\'s first name',
    defaultValue: 'Sarah',
    category: 'character'
  },
  'age': {
    id: 'age',
    name: 'age',
    description: 'Character\'s age (18-35)',
    defaultValue: '22',
    category: 'character'
  },
  'type': {
    id: 'type',
    name: 'type',
    description: 'Character archetype/role',
    defaultValue: 'College Student',
    category: 'character'
  },
  'personality': {
    id: 'personality',
    name: 'personality',
    description: 'Main personality trait',
    defaultValue: 'Shy and innocent',
    category: 'personality'
  },
  'physicalDescription': {
    id: 'physicalDescription',
    name: 'physicalDescription',
    description: 'Detailed physical appearance',
    defaultValue: 'petite with long brown hair and bright green eyes',
    category: 'physical'
  },
  'hair': {
    id: 'hair',
    name: 'hair',
    description: 'Hair color and style',
    defaultValue: 'long blonde hair',
    category: 'physical'
  },
  'eyes': {
    id: 'eyes',
    name: 'eyes',
    description: 'Eye color and expression',
    defaultValue: 'bright blue eyes',
    category: 'physical'
  },
  'bodyType': {
    id: 'bodyType',
    name: 'bodyType',
    description: 'Body build and figure',
    defaultValue: 'petite and curvy',
    category: 'physical'
  },
  'setting': {
    id: 'setting',
    name: 'setting',
    description: 'Location or environment',
    defaultValue: 'cozy bedroom',
    category: 'scenario'
  },
  'mood': {
    id: 'mood',
    name: 'mood',
    description: 'Emotional atmosphere',
    defaultValue: 'intimate and romantic',
    category: 'scenario'
  }
}

// Default template patterns
const defaultPatterns: Record<string, TemplatePattern> = {
  'character-summary': {
    id: 'character-summary',
    name: 'Character Summary',
    description: 'Template for character biography generation',
    template: 'Create a brief, engaging character summary for an adult character named {name}, age {age}, who is a {type} with a {personality} personality. Make it intriguing and hint at her appeal and backstory. Keep it under 50 words and make it slightly suggestive but tasteful.',
    variables: ['name', 'age', 'type', 'personality'],
    category: 'character'
  },
  'physical-description': {
    id: 'physical-description',
    name: 'Physical Description',
    description: 'Template for physical appearance generation',
    template: 'Describe the physical appearance of {name}, a {age}-year-old {type} with a {personality} personality. Include details about her hair, eyes, body type, style, and any distinctive features. Keep it detailed but appropriate, focusing on what makes her attractive and memorable. About 2-3 sentences.',
    variables: ['name', 'age', 'type', 'personality'],
    category: 'character'
  },
  'image-generation': {
    id: 'image-generation',
    name: 'Image Generation',
    description: 'Template for AI image generation prompts',
    template: 'Portrait of {name}, a beautiful {type}, {physicalDescription}, realistic portrait, detailed, high quality, professional photography, attractive, {personality} expression',
    variables: ['name', 'type', 'physicalDescription', 'personality'],
    category: 'image'
  },
  'scenario-setup': {
    id: 'scenario-setup',
    name: 'Scenario Setup',
    description: 'Template for scenario introductions',
    template: 'Create an intimate scenario involving {name}, a {age}-year-old {type} with a {personality} personality. Set it in a {setting} with a {mood} atmosphere. Make it engaging and suggestive while building anticipation.',
    variables: ['name', 'age', 'type', 'personality', 'setting', 'mood'],
    category: 'scenario'
  }
}

export default function TemplateEditor({ onBack }: TemplateEditorProps) {
  const [variables, setVariables] = useKV<Record<string, TemplateVariable>>('template-variables', defaultVariables)
  const [patterns, setPatterns] = useKV<Record<string, TemplatePattern>>('template-patterns', defaultPatterns)
  
  const [newVariable, setNewVariable] = useState<Partial<TemplateVariable>>({
    name: '',
    description: '',
    defaultValue: '',
    category: 'custom'
  })
  
  const [newPattern, setNewPattern] = useState<Partial<TemplatePattern>>({
    name: '',
    description: '',
    template: '',
    variables: [],
    category: 'character'
  })
  
  const [showAddVariable, setShowAddVariable] = useState(false)
  const [showAddPattern, setShowAddPattern] = useState(false)

  const addVariable = () => {
    if (!newVariable.name || !newVariable.description) {
      toast.error('Please fill in all required fields')
      return
    }

    const id = newVariable.name.toLowerCase().replace(/\s+/g, '-')
    const variable: TemplateVariable = {
      id,
      name: newVariable.name,
      description: newVariable.description,
      defaultValue: newVariable.defaultValue || '',
      category: newVariable.category || 'custom'
    }

    setVariables(prev => ({
      ...prev,
      [id]: variable
    }))

    setNewVariable({
      name: '',
      description: '',
      defaultValue: '',
      category: 'custom'
    })
    setShowAddVariable(false)
    toast.success('Variable added successfully')
  }

  const removeVariable = (id: string) => {
    setVariables(prev => {
      const { [id]: removed, ...rest } = prev
      return rest
    })
    toast.success('Variable removed')
  }

  const updateVariable = (id: string, updates: Partial<TemplateVariable>) => {
    setVariables(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }))
  }

  const addPattern = () => {
    if (!newPattern.name || !newPattern.template) {
      toast.error('Please fill in name and template')
      return
    }

    const id = newPattern.name.toLowerCase().replace(/\s+/g, '-')
    
    // Extract variables from template
    const templateVars = (newPattern.template?.match(/\{([^}]+)\}/g) || [])
      .map(match => match.slice(1, -1))
      .filter((v, i, arr) => arr.indexOf(v) === i) // Remove duplicates

    const pattern: TemplatePattern = {
      id,
      name: newPattern.name,
      description: newPattern.description || '',
      template: newPattern.template,
      variables: templateVars,
      category: newPattern.category || 'character'
    }

    setPatterns(prev => ({
      ...prev,
      [id]: pattern
    }))

    setNewPattern({
      name: '',
      description: '',
      template: '',
      variables: [],
      category: 'character'
    })
    setShowAddPattern(false)
    toast.success('Pattern added successfully')
  }

  const removePattern = (id: string) => {
    setPatterns(prev => {
      const { [id]: removed, ...rest } = prev
      return rest
    })
    toast.success('Pattern removed')
  }

  const updatePattern = (id: string, updates: Partial<TemplatePattern>) => {
    if (updates.template) {
      // Extract variables from updated template
      const templateVars = (updates.template.match(/\{([^}]+)\}/g) || [])
        .map(match => match.slice(1, -1))
        .filter((v, i, arr) => arr.indexOf(v) === i)
      updates.variables = templateVars
    }

    setPatterns(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }))
  }

  const resetToDefaults = () => {
    setVariables(defaultVariables)
    setPatterns(defaultPatterns)
    toast.success('Reset to default templates')
  }

  const variablesByCategory = Object.values(variables).reduce((acc, variable) => {
    if (!acc[variable.category]) acc[variable.category] = []
    acc[variable.category].push(variable)
    return acc
  }, {} as Record<string, TemplateVariable[]>)

  const patternsByCategory = Object.values(patterns).reduce((acc, pattern) => {
    if (!acc[pattern.category]) acc[pattern.category] = []
    acc[pattern.category].push(pattern)
    return acc
  }, {} as Record<string, TemplatePattern[]>)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
            <Settings className="text-primary" size={32} weight="fill" />
            <h1 className="text-3xl font-bold text-foreground">Template Editor</h1>
          </div>
          <div className="ml-auto">
            <Button onClick={resetToDefaults} variant="outline" className="border-destructive/30 hover:bg-destructive/10">
              Reset to Defaults
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-6">
          Edit the template variables and patterns used throughout the application for character generation, 
          image creation, and content export. Variables are placeholders like {'{name}'} that get replaced 
          with actual values during generation.
        </div>

        <Tabs defaultValue="variables" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="variables">Template Variables</TabsTrigger>
            <TabsTrigger value="patterns">Template Patterns</TabsTrigger>
          </TabsList>

          <TabsContent value="variables" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">Template Variables</h2>
              <Dialog open={showAddVariable} onOpenChange={setShowAddVariable}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus size={16} className="mr-2" />
                    Add Variable
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Variable</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Variable Name</Label>
                      <Input
                        value={newVariable.name || ''}
                        onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., bodyType"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={newVariable.description || ''}
                        onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="e.g., Body build and figure"
                      />
                    </div>
                    <div>
                      <Label>Default Value</Label>
                      <Input
                        value={newVariable.defaultValue || ''}
                        onChange={(e) => setNewVariable(prev => ({ ...prev, defaultValue: e.target.value }))}
                        placeholder="e.g., petite and curvy"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <select 
                        value={newVariable.category || 'custom'}
                        onChange={(e) => setNewVariable(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full p-2 rounded border border-input bg-background"
                      >
                        <option value="character">Character</option>
                        <option value="physical">Physical</option>
                        <option value="personality">Personality</option>
                        <option value="scenario">Scenario</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <Button onClick={addVariable} className="w-full bg-primary hover:bg-primary/90">
                      Add Variable
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {Object.entries(variablesByCategory).map(([category, categoryVariables]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category} Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryVariables.map((variable) => (
                      <div key={variable.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {'{' + variable.name + '}'}
                            </Badge>
                            <span className="font-medium">{variable.description}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariable(variable.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs">Description</Label>
                            <Input
                              value={variable.description}
                              onChange={(e) => updateVariable(variable.id, { description: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Default Value</Label>
                            <Input
                              value={variable.defaultValue}
                              onChange={(e) => updateVariable(variable.id, { defaultValue: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">Template Patterns</h2>
              <Dialog open={showAddPattern} onOpenChange={setShowAddPattern}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus size={16} className="mr-2" />
                    Add Pattern
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Add New Pattern</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Pattern Name</Label>
                      <Input
                        value={newPattern.name || ''}
                        onChange={(e) => setNewPattern(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Character Backstory"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={newPattern.description || ''}
                        onChange={(e) => setNewPattern(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="e.g., Template for generating character backstories"
                      />
                    </div>
                    <div>
                      <Label>Template</Label>
                      <Textarea
                        value={newPattern.template || ''}
                        onChange={(e) => setNewPattern(prev => ({ ...prev, template: e.target.value }))}
                        placeholder="Use variables like {name}, {age}, {type}, etc."
                        className="min-h-[120px]"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <select 
                        value={newPattern.category || 'character'}
                        onChange={(e) => setNewPattern(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full p-2 rounded border border-input bg-background"
                      >
                        <option value="character">Character</option>
                        <option value="scenario">Scenario</option>
                        <option value="image">Image</option>
                        <option value="export">Export</option>
                      </select>
                    </div>
                    <Button onClick={addPattern} className="w-full bg-primary hover:bg-primary/90">
                      Add Pattern
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {Object.entries(patternsByCategory).map(([category, categoryPatterns]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category} Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {categoryPatterns.map((pattern) => (
                      <div key={pattern.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-foreground">{pattern.name}</h4>
                            <p className="text-sm text-muted-foreground">{pattern.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePattern(pattern.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Variables Used</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {pattern.variables.map((variable) => (
                                <Badge key={variable} variant="secondary" className="text-xs">
                                  {'{' + variable + '}'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs">Template</Label>
                            <Textarea
                              value={pattern.template}
                              onChange={(e) => updatePattern(pattern.id, { template: e.target.value })}
                              className="min-h-[100px] text-sm font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}