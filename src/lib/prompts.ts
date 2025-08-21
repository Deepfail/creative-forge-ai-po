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
  }
}

export function usePrompts() {
  const [prompts, setPrompts] = useKV<Record<string, ChatPrompt>>('chat-prompts', {})
  
  // Auto-populate default prompts if none exist
  useEffect(() => {
    const promptKeys = Object.keys(prompts || {})
    console.log('Prompts check - current prompts keys:', promptKeys)
    
    if (!prompts || promptKeys.length === 0) {
      console.log('No prompts found, auto-populating defaults...')
      console.log('Default prompts available:', Object.keys(defaultPrompts))
      setPrompts(defaultPrompts)
    } else {
      console.log('Prompts already exist:', promptKeys)
    }
  }, [prompts, setPrompts])
  
  // Use current prompts directly from KV store
  const safePrompts = prompts || {}
  
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
      console.log('Updating prompt:', id, 'New prompts:', updatedPrompts)
      return updatedPrompts
    })
  }

  const deletePrompt = (id: string) => {
    setPrompts(current => {
      const currentPrompts = current || {}
      const { [id]: deleted, ...rest } = currentPrompts
      console.log('Deleting prompt:', id, 'Remaining prompts:', rest)
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
      console.log('Adding prompt:', prompt.id, 'New prompts:', newPrompts)
      return newPrompts
    })
  }

  const forceClear = () => {
    console.log('Force clearing all prompts...')
    setPrompts({})
  }

  const loadPrompts = async () => {
    // This function exists for compatibility but KV handles loading automatically
    console.log('loadPrompts called - KV handles loading automatically')
  }

  const savePrompts = async (newPrompts: Record<string, ChatPrompt>) => {
    console.log('Saving prompts:', newPrompts)
    setPrompts(newPrompts)
  }

  const resetToDefaults = () => {
    console.log('Resetting to default prompts...')
    setPrompts(defaultPrompts)
  }

  const getPrompt = (id: string): ChatPrompt | undefined => {
    return safePrompts[id]
  }

  // Get prompt for chat builder (with fallback)
  const getChatBuilderPrompt = (): string => {
    console.log('Getting chat builder prompt...')
    console.log('Available prompts:', Object.keys(safePrompts))
    
    // First try to get Luna specifically
    const lunaPrompt = safePrompts['luna-chat-builder']
    if (lunaPrompt) {
      console.log('Found Luna prompt:', lunaPrompt.name)
      return lunaPrompt.systemPrompt
    }
    
    // Look for any chat builder prompts
    const chatBuilderPrompts = Object.values(safePrompts).filter(p => 
      p.id.includes('chat') || p.id.includes('builder') || p.style?.includes('chat') || p.style?.includes('seductive')
    )
    
    if (chatBuilderPrompts.length > 0) {
      console.log('Found chat builder prompt:', chatBuilderPrompts[0].name)
      return chatBuilderPrompts[0].systemPrompt
    }
    
    // Try default prompts if current prompts are empty
    const defaultLuna = defaultPrompts['luna-chat-builder']
    if (defaultLuna) {
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
    getPrompt,
    getChatBuilderPrompt
  }
}