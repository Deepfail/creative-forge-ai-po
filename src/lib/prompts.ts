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
  const [prompts, setPrompts] = useKV<Record<string, ChatPrompt>>('chat-prompts', {})
  
  // Force initialization on first load if prompts is empty
  useEffect(() => {
    console.log('usePrompts useEffect: prompts =', prompts)
    console.log('usePrompts useEffect: prompts length =', prompts ? Object.keys(prompts).length : 0)
    
    // Initialize with defaults if we have an empty object or null
    if (!prompts || Object.keys(prompts).length === 0) {
      console.log('usePrompts: Initializing default prompts because prompts is empty')
      console.log('usePrompts: Setting prompts to:', defaultPrompts)
      setPrompts(defaultPrompts)
    }
  }, [setPrompts])  // Only depend on setPrompts to avoid loops
  
  // Always ensure we have valid prompts - use defaults as fallback
  const safePrompts = (prompts && Object.keys(prompts).length > 0) ? prompts : defaultPrompts
  
  // Compute sorted prompts
  const sortedPrompts = useMemo(() => {
    const allPrompts = Object.values(safePrompts)
    console.log('Computing sorted prompts from:', allPrompts)
    return allPrompts.sort((a, b) => b.updatedAt - a.updatedAt)
  }, [safePrompts])

  console.log('usePrompts - Current prompts keys:', Object.keys(safePrompts))
  console.log('usePrompts - Sorted prompts count:', sortedPrompts.length)
  console.log('usePrompts - Raw prompts:', prompts)

  const updatePrompt = (id: string, updates: Partial<ChatPrompt>) => {
    console.log('updatePrompt called for id:', id, 'with updates:', updates)
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
      console.log('updatePrompt: updating prompts to:', updatedPrompts)
      return updatedPrompts
    })
  }

  const deletePrompt = (id: string) => {
    console.log('deletePrompt called for id:', id)
    setPrompts(current => {
      const currentPrompts = current || {}
      const { [id]: deleted, ...rest } = currentPrompts
      console.log('deletePrompt: removing prompt, remaining:', rest)
      return rest
    })
  }

  const addPrompt = (prompt: Omit<ChatPrompt, 'updatedAt'>) => {
    console.log('addPrompt called with prompt:', prompt)
    setPrompts(current => {
      const currentPrompts = current || {}
      const newPrompts = {
        ...currentPrompts,
        [prompt.id]: {
          ...prompt,
          updatedAt: Date.now()
        }
      }
      console.log('addPrompt: adding prompt, new prompts:', newPrompts)
      return newPrompts
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