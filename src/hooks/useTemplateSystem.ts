import { useKV } from '@github/spark/hooks'

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

export function useTemplateSystem() {
  const [variables] = useKV<Record<string, TemplateVariable>>('template-variables', defaultVariables)
  const [patterns] = useKV<Record<string, TemplatePattern>>('template-patterns', defaultPatterns)

  const replaceVariables = (template: string, values: Record<string, string>) => {
    let result = template
    
    Object.entries(values).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value)
    })
    
    return result
  }

  const getPattern = (id: string): TemplatePattern | undefined => {
    return patterns[id]
  }

  const getVariable = (id: string): TemplateVariable | undefined => {
    return variables[id]
  }

  const extractVariables = (template: string): string[] => {
    const matches = template.match(/\{([^}]+)\}/g) || []
    return matches.map(match => match.slice(1, -1)).filter((v, i, arr) => arr.indexOf(v) === i)
  }

  // Get templates by category
  const getPatternsByCategory = (category: TemplatePattern['category']) => {
    return Object.values(patterns).filter(pattern => pattern.category === category)
  }

  // Helper to get commonly used patterns
  const getCharacterSummaryTemplate = (): string => {
    const pattern = patterns['character-summary']
    return pattern?.template || defaultPatterns['character-summary'].template
  }

  const getPhysicalDescriptionTemplate = (): string => {
    const pattern = patterns['physical-description']
    return pattern?.template || defaultPatterns['physical-description'].template
  }

  const getImageGenerationTemplate = (): string => {
    const pattern = patterns['image-generation']
    return pattern?.template || defaultPatterns['image-generation'].template
  }

  return {
    variables,
    patterns,
    replaceVariables,
    getPattern,
    getVariable,
    extractVariables,
    getPatternsByCategory,
    getCharacterSummaryTemplate,
    getPhysicalDescriptionTemplate,
    getImageGenerationTemplate
  }
}