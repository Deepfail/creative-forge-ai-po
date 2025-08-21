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

// Empty default prompts - user must create their own
export const defaultPrompts: Record<string, ChatPrompt> = {}

export function usePrompts() {
  const [prompts, setPrompts] = useKV<Record<string, ChatPrompt>>('chat-prompts', {})
  
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

  const getPrompt = (id: string): ChatPrompt | undefined => {
    return safePrompts[id]
  }

  // Get prompt for chat builder (with fallback)
  const getChatBuilderPrompt = (): string => {
    // Look for any chat builder prompts first
    const chatBuilderPrompts = Object.values(safePrompts).filter(p => 
      p.id.includes('chat') || p.id.includes('builder') || p.style?.includes('chat')
    )
    
    if (chatBuilderPrompts.length > 0) {
      return chatBuilderPrompts[0].systemPrompt
    }
    
    // Fallback to default chat builder prompt
    return `You are an AI assistant helping to create custom NSFW content. Based on the conversation, help the user refine their ideas and preferences for characters or scenarios.

Instructions:
- Ask follow-up questions to understand their preferences better
- Suggest ideas and variations based on what they've told you
- Be helpful and creative while staying focused on content creation
- Keep responses conversational and engaging
- When they seem ready, offer to generate their custom content`
  }

  return {
    prompts: safePrompts,
    sortedPrompts,
    updatePrompt,
    deletePrompt,
    addPrompt,
    setPrompts,
    forceClear,
    getPrompt,
    getChatBuilderPrompt
  }
}