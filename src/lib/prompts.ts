import { useKV } from '@github/spark/hooks'
import React, { useMemo, useEffect } from 'react'

export interface ChatPrompt {
  id: string
  name: string
  description?: string
  greeting?: string
  style?: string
  systemPrompt: string
  updatedAt: number
}

export const defaultPrompts: Record<string, ChatPrompt> = {
  'character-creation': {
    id: 'character-creation',
    name: 'Character Creator',
    description: 'Creates detailed NSFW characters based on user inputs',
    systemPrompt: `Create a detailed NSFW character based on the following details:

Name: {name}
Age: {age}
Type: {type}
Personality: {personality}
Physical Description: {physicalDescription}
Background: {background}
Kinks/Fetishes: {kinks}
Sexual Preferences: {sexualPreferences}

Generate a comprehensive character profile including:
1. Detailed physical appearance
2. Personality traits and quirks
3. Sexual preferences and kinks
4. Background story
5. How they interact with others
6. Their goals and motivations

Make the description vivid, engaging, and suitable for adult roleplay scenarios.`,
    updatedAt: Date.now()
  },
  'scenario-creation': {
    id: 'scenario-creation',
    name: 'Scenario Builder',
    description: 'Creates immersive NSFW scenarios and interactive experiences',
    systemPrompt: `Create an immersive NSFW scenario based on these parameters:

Setting: {setting}
Characters: {characters}
Theme: {theme}
Tone: {tone}
Kinks: {kinks}
Plot Elements: {plotElements}

Generate a detailed scenario including:
1. Scene setting and atmosphere
2. Character introductions and dynamics
3. Initial situation and tension
4. Possible progression paths
5. Interactive elements
6. Climactic moments

Make it engaging, immersive, and suitable for adult interactive experiences.`,
    updatedAt: Date.now()
  }
}

export function usePrompts() {
  const [prompts, setPrompts] = useKV<Record<string, ChatPrompt>>('chat-prompts', {})
  
  // Force initialize with defaults on first load if empty, and remove any Luna prompts
  useEffect(() => {
    if (!prompts || Object.keys(prompts).length === 0) {
      console.log('Initializing prompts with defaults...')
      setPrompts(defaultPrompts)
    } else {
      // Remove any Luna prompts if they exist
      const currentPrompts = prompts || {}
      const hasLuna = Object.entries(currentPrompts).some(([key, prompt]) => 
        key.includes('luna') || 
        prompt.name.toLowerCase().includes('luna') || 
        prompt.systemPrompt.toLowerCase().includes('luna')
      )
      
      if (hasLuna) {
        console.log('Removing Luna prompts automatically...')
        const filteredPrompts: Record<string, ChatPrompt> = {}
        Object.entries(currentPrompts).forEach(([key, prompt]) => {
          if (!key.includes('luna') && 
              !prompt.name.toLowerCase().includes('luna') && 
              !prompt.systemPrompt.toLowerCase().includes('luna')) {
            filteredPrompts[key] = prompt
          }
        })
        setPrompts(filteredPrompts)
      }
    }
  }, [prompts, setPrompts])
  
  // Always ensure we have valid prompts - use defaults as fallback
  const safePrompts = (prompts && Object.keys(prompts).length > 0) ? prompts : defaultPrompts
  
  // Compute sorted prompts
  const sortedPrompts = useMemo(() => {
    const allPrompts = Object.values(safePrompts)
    return allPrompts.sort((a, b) => b.updatedAt - a.updatedAt)
  }, [safePrompts])

  const updatePrompt = (id: string, updates: Partial<ChatPrompt>) => {
    setPrompts(current => {
      const currentPrompts = current || {}
      const updatedPrompts = {
        ...currentPrompts,
        [id]: {
          ...currentPrompts[id],
          ...updates,
          updatedAt: Date.now()
        }
      }
      return updatedPrompts
    })
  }

  const deletePrompt = (id: string) => {
    setPrompts(current => {
      const currentPrompts = current || {}
      const { [id]: deleted, ...rest } = currentPrompts
      return rest
    })
  }

  const addPrompt = (prompt: Omit<ChatPrompt, 'updatedAt'>) => {
    setPrompts(current => {
      const currentPrompts = current || {}
      const newPrompts = {
        ...currentPrompts,
        [prompt.id]: {
          ...prompt,
          updatedAt: Date.now()
        }
      }
      return newPrompts
    })
  }

  const forceReset = () => {
    console.log('Force resetting prompts to defaults...')
    setPrompts(defaultPrompts)
  }

  const forceClear = () => {
    console.log('Force clearing all prompts...')
    setPrompts({})
  }

  return {
    prompts: safePrompts,
    sortedPrompts,
    updatePrompt,
    deletePrompt,
    addPrompt,
    setPrompts,
    forceReset,
    forceClear
  }
}