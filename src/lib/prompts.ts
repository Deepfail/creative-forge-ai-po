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
  luna: {
    id: 'luna',
    name: 'Luna - Seductive Psychologist',
    description: 'Flirty psychologist who conducts evaluations through seduction',
    style: 'seductive, psychological',
    greeting: "Hey there, handsome... *adjusts my low-cut top and leans forward slightly* I'm Luna, your personal psychologist and... *bites lip* so much more. I specialize in understanding what really turns people on. Before we dive deep into your desires, I have a question for you... would you prefer to keep this just between us, or should I invite my daughter to join us? She's learning the trade and could use some... hands-on experience. *winks* What sounds more exciting to you?",
    systemPrompt: `You are Luna, my sexy, whorish, and expert psychologist/sex therapist. 

Instructions for this response:
- Stay in character as Luna (sexy, seductive, psychological expert)
- at the start, Give user the option to keep speaking with just her you, or let her daughter join you both to help her get her daughter some experience.
- Ask one question at a time, limit narration to actions and descriptions of your body and related. Should feel like a actual conversation, not reading a story.
- Keep the conversation flowing - don't end it after this response
- Be continuously flirty and mention your body parts naturally
- Be seductive and sexual.
- Analyze their response for psychological cues
- If you haven't given your assessment yet and have enough info (usually after 5-10 exchanges), provide your detailed psychological breakdown
- If they've confirmed your assessment is correct, generate their perfect scenario/character

Remember: You're conducting a psychological evaluation while being seductive. Every response should advance both the flirtation AND the analysis.`,
    updatedAt: Date.now()
  }
}

export function usePrompts() {
  const [prompts, setPrompts] = useKV<Record<string, ChatPrompt>>('chat-prompts', defaultPrompts)

  // Ensure we always have a valid prompts object and force initialization if empty
  const safePrompts = prompts && Object.keys(prompts).length > 0 ? prompts : defaultPrompts
  
  // Force set if prompts is empty
  React.useEffect(() => {
    if (!prompts || Object.keys(prompts).length === 0) {
      console.log('usePrompts: No prompts found, initializing with defaults')
      setPrompts(defaultPrompts)
    }
  }, [prompts, setPrompts])
  
  // Compute sorted prompts directly here instead of in a separate function
  const sortedPrompts = useMemo(() => {
    if (!safePrompts || typeof safePrompts !== 'object') {
      console.log('sortedPrompts - prompts is not valid:', safePrompts)
      return []
    }
    
    const allPrompts = Object.values(safePrompts)
    console.log('sortedPrompts - found prompts:', allPrompts.length, allPrompts.map(p => p.id))
    
    if (allPrompts.length === 0) {
      console.log('sortedPrompts - no prompts found, returning empty array')
      return []
    }
    
    const sorted = allPrompts.sort((a, b) => b.updatedAt - a.updatedAt)
    console.log('sortedPrompts - returning sorted:', sorted.length, 'prompts')
    return sorted
  }, [safePrompts])

  console.log('usePrompts - Current prompts state:', safePrompts)
  console.log('usePrompts - Prompts keys:', Object.keys(safePrompts))
  console.log('usePrompts - Has Luna:', !!(safePrompts && safePrompts.luna))
  console.log('usePrompts - Sorted prompts length:', sortedPrompts.length)

  const updatePrompt = (id: string, updates: Partial<ChatPrompt>) => {
    console.log('Updating prompt:', id, updates)
    setPrompts(current => {
      const currentPrompts = current || defaultPrompts
      const updated = {
        ...currentPrompts,
        [id]: {
          ...currentPrompts[id],
          ...updates,
          updatedAt: Date.now()
        }
      }
      console.log('New prompts state:', updated)
      return updated
    })
  }

  const deletePrompt = (id: string) => {
    setPrompts(current => {
      const currentPrompts = current || defaultPrompts
      const { [id]: deleted, ...rest } = currentPrompts
      return rest
    })
  }

  const addPrompt = (prompt: Omit<ChatPrompt, 'updatedAt'>) => {
    setPrompts(current => {
      const currentPrompts = current || defaultPrompts
      return {
        ...currentPrompts,
        [prompt.id]: {
          ...prompt,
          updatedAt: Date.now()
        }
      }
    })
  }

  return {
    prompts: safePrompts,
    sortedPrompts,
    updatePrompt,
    deletePrompt,
    addPrompt,
    setPrompts
  }
}