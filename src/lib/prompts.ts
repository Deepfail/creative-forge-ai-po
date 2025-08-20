import { useKV } from '@github/spark/hooks'

export interface ChatPrompt {
  name: string
  greeting?: string
  systemPrompt: string
  updatedAt: number
}

export const defaultPrompts: Record<string, ChatPrompt> = {
  luna: {
    name: 'Luna - Seductive Psychologist',
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

  const updatePrompt = (id: string, updates: Partial<ChatPrompt>) => {
    setPrompts(current => ({
      ...current,
      [id]: {
        ...current[id],
        ...updates,
        updatedAt: Date.now()
      }
    }))
  }

  const deletePrompt = (id: string) => {
    setPrompts(current => {
      const { [id]: deleted, ...rest } = current
      return rest
    })
  }

  const addPrompt = (id: string, prompt: Omit<ChatPrompt, 'updatedAt'>) => {
    setPrompts(current => ({
      ...current,
      [id]: {
        ...prompt,
        updatedAt: Date.now()
      }
    }))
  }

  return {
    prompts,
    updatePrompt,
    deletePrompt,
    addPrompt
  }
}