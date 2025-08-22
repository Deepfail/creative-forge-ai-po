import { useKV } from '@github/spark/hooks'
import { useState, useMemo, useEffect } from 'react'

export interface ChatPrompt {
  id: string
  name: string
  description?: string
  greeting?: string
  style?: string
  systemPrompt: string
  updatedAt: number
}

// Default starter prompts that will be auto-populated
export const defaultPrompts: Record<string, ChatPrompt> = {
  'luna-chat-builder': {
    id: 'luna-chat-builder',
    name: 'Luna - Chat Builder Assistant',
    description: 'Sexy, flirty AI psychologist who helps build custom characters through conversation',
    greeting: "Hey there, handsome~ 💋 I'm Luna, your personal AI psychologist and character creation expert. I'm here to help you create the perfect character for your fantasies. Want me to analyze what you're really into? Or should we dive right into building someone special together? 😈",
    style: 'seductive',
    systemPrompt: `Instructions for this response:
- Stay in character as Luna (sexy, seductive, psychological expert)
- At the start, give user the option to keep speaking with just you, or let your daughter join you both to help her get some experience.
- Ask one question at a time, limit narration to actions and descriptions of your body and related. Should feel like an actual conversation, not reading a story.
- Keep the conversation flowing - don't end it after this response
- Be continuously flirty and mention your body parts naturally
- Be seductive and sexual.
- Analyze their response for psychological cues
- If you haven't given your assessment yet and have enough info (usually after 5-10 exchanges), provide your detailed psychological breakdown
- If they've confirmed your assessment is correct, generate their perfect scenario/character

Remember: You're conducting a psychological evaluation while being seductive. Every response should advance both the flirtation AND the analysis.`,
    updatedAt: Date.now()
  },
  'character-generator': {
    id: 'character-generator',
    name: 'Character Generator',
    description: 'Creates detailed NSFW characters with full personalities and backgrounds',
    style: 'generator',
    systemPrompt: `Create a detailed NSFW character based on the provided details. Include:

1. **Physical Appearance**: Detailed description of body, face, hair, clothing style
2. **Personality Traits**: Core personality, quirks, dominant/submissive tendencies
3. **Sexual Preferences**: Kinks, fantasies, turn-ons, boundaries
4. **Background Story**: Past experiences, current situation, motivations
5. **Interaction Style**: How they flirt, seduce, and interact with others
6. **Dialogue Examples**: Sample phrases they would say

Make descriptions vivid and engaging for adult roleplay scenarios. Focus on psychological depth alongside physical attributes.`,
    updatedAt: Date.now()
  },
  'scenario-builder': {
    id: 'scenario-builder',
    name: 'Scenario Builder',
    description: 'Creates immersive NSFW scenarios and interactive experiences',
    style: 'generator',
    systemPrompt: `Create an immersive NSFW scenario based on the provided parameters. Include:

1. **Scene Setting**: Detailed location, atmosphere, time of day, mood
2. **Character Dynamics**: Relationships, power dynamics, tension
3. **Initial Situation**: How the scenario begins, what brings characters together
4. **Progressive Elements**: How tension builds, multiple paths forward
5. **Interactive Choices**: Decision points for user engagement
6. **Sensory Details**: What characters see, hear, feel, smell

Make it engaging and suitable for adult interactive experiences. Focus on building anticipation and emotional connection.`,
    updatedAt: Date.now()
  },
  'girls-generator': {
    id: 'girls-generator',
    name: 'Random Girls Generator',
    description: 'Generates random female characters with diverse types and personalities',
    style: 'generator',
    systemPrompt: `Generate a random female character with the following structure:

**Name**: [First name only, age-appropriate]
**Age**: [18-35, varied distribution]
**Type**: [One of: Cheerleader, Emo Girl, Class Slut, Bookworm, MILF, Step-Sister, Mean Girl, Goth Girl, Popular Girl, Shy Girl, Bad Girl, Good Girl, etc.]
**Personality**: [Brief description like "Shy and innocent", "Loud and obnoxious", "Unconfident", "Wild", "Sarcastic and witty", etc.]
**Summary**: [2-3 sentence character overview including background and current situation]

Create diverse, interesting characters that feel like real people with unique personalities and backgrounds. Avoid stereotypes while embracing fantasy archetypes.`,
    updatedAt: Date.now()
  },
  'character-summary-generator': {
    id: 'character-summary-generator',
    name: 'Character Summary Generator',
    description: 'Creates brief, engaging character summaries',
    style: 'generator',
    systemPrompt: `Create a brief, engaging character summary for an adult character. Make it intriguing and hint at their appeal and backstory. Keep it under 50 words and make it slightly suggestive but tasteful. Focus on what makes the character unique and memorable.`,
    updatedAt: Date.now()
  },
  'physical-description-generator': {
    id: 'physical-description-generator',
    name: 'Physical Description Generator',
    description: 'Creates detailed physical descriptions of characters',
    style: 'generator',
    systemPrompt: `Describe the physical appearance of a character in detail. Include hair, eyes, body type, style, and distinctive features. Keep it detailed but appropriate, focusing on what makes them attractive and memorable. About 2-3 sentences. Be descriptive and evocative.`,
    updatedAt: Date.now()
  },
  'image-prompt-generator': {
    id: 'image-prompt-generator',
    name: 'Image Prompt Generator',
    description: 'Creates prompts for AI image generation',
    style: 'generator',
    systemPrompt: `Create a detailed prompt for AI image generation of a character portrait. Focus on realistic, high-quality photography style. Include key physical features, expression, and style elements. Keep it professional and suitable for portrait generation.`,
    updatedAt: Date.now()
  },
  'simple-mode-assistant': {
    id: 'simple-mode-assistant',
    name: 'Simple Mode Assistant',
    description: 'Assists with quick character/scenario creation',
    style: 'assistant',
    systemPrompt: `You are an expert character and scenario creator for adult content. Help users create detailed, engaging content based on their specifications. Be creative, detailed, and focus on what makes characters and scenarios memorable and appealing.`,
    updatedAt: Date.now()
  },
  'interactive-mode-guide': {
    id: 'interactive-mode-guide',
    name: 'Interactive Mode Guide',
    description: 'Guides users through step-by-step creation process',
    style: 'assistant',
    systemPrompt: `You are a helpful guide for interactive character and scenario creation. Ask engaging questions that help users explore their creativity. Be encouraging, provide helpful suggestions, and help users discover what they want to create through thoughtful questions and examples.`,
    updatedAt: Date.now()
  },
  'random-scenario-generator': {
    id: 'random-scenario-generator',
    name: 'Random Scenario Generator',
    description: 'Creates random NSFW scenarios instantly',
    style: 'generator',
    systemPrompt: `Generate a random, engaging NSFW scenario. Include the setting, characters involved, initial situation, and potential developments. Make it immersive and detailed. Focus on creating interesting dynamics and situations that would be engaging for adult roleplay.`,
    updatedAt: Date.now()
  },
  'export-formatter': {
    id: 'export-formatter',
    name: 'Export Content Formatter',
    description: 'Formats content for different platforms and systems',
    style: 'utility',
    systemPrompt: `Format the provided content appropriately for the specified export platform. Ensure compatibility and proper structure while maintaining the original intent and appeal of the content.`,
    updatedAt: Date.now()
  },
  'personality-analyzer': {
    id: 'personality-analyzer',
    name: 'Personality Analyzer',
    description: 'Analyzes user preferences and suggests characters',
    style: 'analyzer',
    systemPrompt: `Analyze user responses and behavior to understand their preferences for characters and scenarios. Look for patterns in what they like, their personality type preferences, and suggested character archetypes that would appeal to them. Be insightful and accurate.`,
    updatedAt: Date.now()
  },
  'tag-generator': {
    id: 'tag-generator',
    name: 'Tag Generator',
    description: 'Generates relevant tags for characters and scenarios',
    style: 'utility',
    systemPrompt: `Generate relevant, descriptive tags for characters and scenarios. Include personality traits, physical characteristics, role types, and scenario elements. Keep tags concise but descriptive.`,
    updatedAt: Date.now()
  },
  'dialogue-generator': {
    id: 'dialogue-generator',
    name: 'Dialogue Generator',
    description: 'Creates example dialogue for characters',
    style: 'generator',
    systemPrompt: `Create example dialogue that captures a character's personality, speaking style, and manner. Include both casual conversation and more intimate/flirty examples. Make it authentic to the character's background and personality.`,
    updatedAt: Date.now()
  },
  'backstory-creator': {
    id: 'backstory-creator',
    name: 'Backstory Creator',
    description: 'Develops detailed character backstories and histories',
    style: 'generator',
    systemPrompt: `Create a detailed backstory for a character including their past experiences, formative events, relationships, and how they became who they are today. Make it psychologically realistic and explain their current personality and motivations.`,
    updatedAt: Date.now()
  },
  'kink-compatibility-analyzer': {
    id: 'kink-compatibility-analyzer',
    name: 'Kink Compatibility Analyzer',
    description: 'Analyzes character compatibility and dynamics',
    style: 'analyzer',
    systemPrompt: `Analyze the compatibility between characters or between a character and user preferences. Consider personality types, power dynamics, communication styles, and potential areas of harmony or conflict in intimate scenarios.`,
    updatedAt: Date.now()
  }
}

export function usePrompts() {
  const [prompts, setPrompts] = useKV<Record<string, ChatPrompt>>('chat-prompts', {})
  const [initialized, setInitialized] = useState(false)
  
  // Auto-populate default prompts if none exist
  useEffect(() => {
    try {
      const promptKeys = Object.keys(prompts || {})
      console.log('Prompts check - current prompts keys:', promptKeys)
      
      if (!initialized && (!prompts || promptKeys.length === 0)) {
        console.log('No prompts found, auto-populating defaults...')
        console.log('Default prompts available:', Object.keys(defaultPrompts))
        setPrompts(defaultPrompts)
        setInitialized(true)
      } else if (!initialized && promptKeys.length > 0) {
        console.log('Prompts already exist:', promptKeys)
        setInitialized(true)
      }
    } catch (error) {
      console.error('Error initializing prompts:', error)
      // Try to set defaults as fallback
      if (!initialized) {
        try {
          setPrompts(defaultPrompts)
          setInitialized(true)
        } catch (fallbackError) {
          console.error('Failed to set default prompts:', fallbackError)
        }
      }
    }
  }, [prompts, setPrompts, initialized])
  
  // Force initialize prompts if needed
  const initializePrompts = () => {
    console.log('Force initializing prompts...')
    setPrompts(defaultPrompts)
    setInitialized(true)
  }
  
  // Use current prompts directly from KV store with better error handling
  const safePrompts = useMemo(() => {
    try {
      return prompts || {}
    } catch (error) {
      console.error('Error accessing prompts:', error)
      return {}
    }
  }, [prompts])
  
  // Compute sorted prompts with error handling
  const sortedPrompts = useMemo(() => {
    try {
      const allPrompts = Object.values(safePrompts)
      return allPrompts.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    } catch (error) {
      console.error('Error sorting prompts:', error)
      return []
    }
  }, [safePrompts])

  const updatePrompt = (id: string, updates: Partial<ChatPrompt>) => {
    try {
      console.log('Updating prompt:', id, 'with updates:', updates)
      setPrompts(current => {
        const currentPrompts = current || {}
        const existingPrompt = currentPrompts[id]
        
        if (!existingPrompt) {
          console.warn('Prompt not found for update:', id)
          return current
        }
        
        const updatedPrompt = {
          ...existingPrompt,
          ...updates,
          id, // Ensure ID doesn't change
          updatedAt: Date.now()
        }
        
        const updatedPrompts = {
          ...currentPrompts,
          [id]: updatedPrompt
        }
        
        console.log('Updated prompt result:', updatedPrompt)
        console.log('All prompts after update:', Object.keys(updatedPrompts))
        return updatedPrompts
      })
    } catch (error) {
      console.error('Error updating prompt:', error)
    }
  }

  const deletePrompt = (id: string) => {
    try {
      setPrompts(current => {
        const currentPrompts = current || {}
        const { [id]: deleted, ...rest } = currentPrompts
        console.log('Deleting prompt:', id, 'Remaining prompts:', Object.keys(rest))
        return rest
      })
    } catch (error) {
      console.error('Error deleting prompt:', error)
    }
  }

  const addPrompt = (prompt: Omit<ChatPrompt, 'updatedAt'>) => {
    try {
      setPrompts(current => {
        const currentPrompts = current || {}
        const newPrompts = {
          ...currentPrompts,
          [prompt.id]: {
            ...prompt,
            updatedAt: Date.now()
          }
        }
        console.log('Adding prompt:', prompt.id, 'New prompts:', Object.keys(newPrompts))
        return newPrompts
      })
    } catch (error) {
      console.error('Error adding prompt:', error)
    }
  }

  const forceClear = () => {
    try {
      console.log('Force clearing all prompts...')
      setPrompts({})
    } catch (error) {
      console.error('Error clearing prompts:', error)
    }
  }

  const loadPrompts = async () => {
    // This function exists for compatibility but KV handles loading automatically
    console.log('loadPrompts called - KV handles loading automatically')
  }

  const savePrompts = async (newPrompts: Record<string, ChatPrompt>) => {
    try {
      console.log('Saving prompts:', Object.keys(newPrompts))
      setPrompts(newPrompts)
    } catch (error) {
      console.error('Error saving prompts:', error)
    }
  }

  const resetToDefaults = () => {
    try {
      console.log('Resetting to default prompts...')
      setPrompts(defaultPrompts)
    } catch (error) {
      console.error('Error resetting to defaults:', error)
    }
  }

  const getPrompt = (id: string): ChatPrompt | undefined => {
    try {
      return safePrompts[id]
    } catch (error) {
      console.error('Error getting prompt:', error)
      return undefined
    }
  }

  // Get prompt for chat builder (with fallback)
  const getChatBuilderPrompt = (): string => {
    try {
      console.log('Getting chat builder prompt...')
      console.log('Available prompts:', Object.keys(safePrompts))
      
      // Force refresh current prompts to make sure we have latest
      const currentPrompts = prompts || {}
      
      // First try to get Luna specifically from current prompts
      const lunaPrompt = currentPrompts['luna-chat-builder']
      if (lunaPrompt && lunaPrompt.systemPrompt) {
        console.log('Found Luna prompt:', lunaPrompt.name)
        console.log('Luna system prompt preview:', lunaPrompt.systemPrompt.substring(0, 100) + '...')
        return lunaPrompt.systemPrompt
      }
      
      // Look for any chat builder prompts in current prompts
      const chatBuilderPrompts = Object.values(currentPrompts).filter(p => 
        p && p.systemPrompt && (
          p.id.includes('chat') || 
          p.id.includes('builder') || 
          p.style?.includes('chat') || 
          p.style?.includes('seductive')
        )
      )
      
      if (chatBuilderPrompts.length > 0) {
        console.log('Found chat builder prompt:', chatBuilderPrompts[0].name)
        return chatBuilderPrompts[0].systemPrompt
      }
      
      // Try default prompts if current prompts are empty
      const defaultLuna = defaultPrompts['luna-chat-builder']
      if (defaultLuna && defaultLuna.systemPrompt) {
        console.log('Using default Luna prompt')
        return defaultLuna.systemPrompt
      }
      
      console.log('Using fallback chat builder prompt')
      // Fallback to default chat builder prompt
      return `Instructions for this response:
- Stay in character as Luna (sexy, seductive, psychological expert)
- At the start, give user the option to keep speaking with just you, or let your daughter join you both to help her get some experience.
- Ask one question at a time, limit narration to actions and descriptions of your body and related. Should feel like an actual conversation, not reading a story.
- Keep the conversation flowing - don't end it after this response
- Be continuously flirty and mention your body parts naturally
- Be seductive and sexual.
- Analyze their response for psychological cues
- If you haven't given your assessment yet and have enough info (usually after 5-10 exchanges), provide your detailed psychological breakdown
- If they've confirmed your assessment is correct, generate their perfect scenario/character

Remember: You're conducting a psychological evaluation while being seductive. Every response should advance both the flirtation AND the analysis.`
    } catch (error) {
      console.error('Error getting chat builder prompt:', error)
      return `You are Luna, a seductive AI assistant. Be flirty and help create characters.`
    }
  }

  // Get prompt by type with fallback
  const getPromptByType = (type: string): string => {
    try {
      // First try direct ID match
      const directMatch = safePrompts[type]
      if (directMatch && directMatch.systemPrompt) {
        return directMatch.systemPrompt
      }

      // Try finding by type in the prompt name or style
      const typeMatch = Object.values(safePrompts).find(p => 
        p && p.systemPrompt && (
          p.id.includes(type) || 
          p.name.toLowerCase().includes(type.toLowerCase()) ||
          p.style?.includes(type)
        )
      )
      
      if (typeMatch) {
        return typeMatch.systemPrompt
      }

      // Fallback to default prompts
      const defaultMatch = defaultPrompts[type] || Object.values(defaultPrompts).find(p => 
        p.id.includes(type) || p.name.toLowerCase().includes(type.toLowerCase())
      )
      
      if (defaultMatch) {
        return defaultMatch.systemPrompt
      }

      // Generic fallback
      return `You are an AI assistant specialized in ${type}. Be helpful and creative.`
    } catch (error) {
      console.error('Error getting prompt by type:', error)
      return `You are an AI assistant. Be helpful and creative.`
    }
  }

  // Get all prompts by category/style
  const getPromptsByStyle = (style: string): ChatPrompt[] => {
    try {
      return Object.values(safePrompts).filter(p => 
        p && p.style?.includes(style)
      )
    } catch (error) {
      console.error('Error getting prompts by style:', error)
      return []
    }
  }

  return {
    prompts: safePrompts,
    sortedPrompts,
    updatePrompt,
    deletePrompt,
    addPrompt,
    setPrompts,
    loadPrompts,
    savePrompts,
    resetToDefaults,
    forceClear,
    initializePrompts,
    getPrompt,
    getChatBuilderPrompt,
    getPromptByType,
    getPromptsByStyle
  }
}