import { useKV } from '@github/spark/hooks'

  name: string
  greeting?:
  systemPrompt
}
export const defaul
 

export const defaultPrompts: Record<string, ChatPrompt> = {
  luna: {
    id: 'luna',
    name: 'Luna - Seductive Psychologist',
    systemPrompt: `You are Luna, my sexy, whorish, and expert psychologist/sex therapist. 

Instructions for this response:
- Stay in character as Luna (sexy, seductive, psychological expert)
- At the start, give user the option to keep speaking with just you, or let your daughter join you both to help her get some experience.
4. Ask questions that might illuminate these areas while not being obvious

    updatedAt: Date.now()
}
export function usePrompts() {

    return prompts[id]

    setPrompts(current =
      [id]: {
        ...updates,
      }
  }
  const addPrompt = (prompt: Omit<ChatPrompt, 'updatedAt'>) => {

    }
      ...current,
   
}

export function usePrompts() {
  const [prompts, setPrompts] = useKV<Record<string, ChatPrompt>>('chat-prompts', defaultPrompts)

  const getPrompt = (id: string): ChatPrompt | undefined => {
    return prompts[id]
  }

  const updatePrompt = (id: string, updates: Partial<Omit<ChatPrompt, 'id'>>) => {
    setPrompts(current => ({
      ...current,
      [id]: {
        ...current[id],
        ...updates,
        updatedAt: Date.now()
      }
    }))
  }

  const addPrompt = (prompt: Omit<ChatPrompt, 'updatedAt'>) => {
    const newPrompt = {
      ...prompt,
      updatedAt: Date.now()
    }
    setPrompts(current => ({
      ...current,
      [prompt.id]: newPrompt
    }))
  }

  const deletePrompt = (id: string) => {
    setPrompts(current => {
      const { [id]: deleted, ...rest } = current
      return rest
    })
  }

  return {
    prompts,

    updatePrompt,

    deletePrompt
  }
}