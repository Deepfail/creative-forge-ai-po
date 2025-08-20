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

export const defaultPrompts: Record<string, ChatPrompt> = {}

export function usePrompts() {
  const [prompts, setPrompts] = useKV<Record<string, ChatPrompt>>('chat-prompts', {})
  
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

  return {
    prompts: safePrompts,
    sortedPrompts,
    updatePrompt,
    deletePrompt,
    addPrompt,
    setPrompts
  }
}