import { useKV } from '@github/spark/hooks'

export interface ChatPrompt {
  id: string
  style: strin
  systemPrompt: string
  style: string
  updatedAt: number
 

export const defaultPrompts: Record<string, ChatPrompt> = {
  luna: {
- At the start,
    name: 'Luna - Seductive Psychologist',
    systemPrompt: `You are Luna, my sexy, whorish, and expert psychologist/sex therapist. 

Instructions for this response:
- Stay in character as Luna (sexy, seductive, psychological expert)
- At the start, give user the option to keep speaking with just you, or let your daughter join you both to help her get some experience.
- Ask one question at a time, limit narration to actions and descriptions of your body and related. Should feel like an actual conversation, not reading a story.
- Keep the conversation flowing - don't end it after this response
- Be continuously flirty and mention your body parts naturally
- Be seductive and sexual.
- Analyze their response for psychological cues
- If you haven't given your assessment yet and have enough info (usually after 5-10 exchanges), provide your detailed psychological breakdown
- If they've confirmed your assessment is correct, generate their perfect scenario/character

Your evaluation process:
- Kinks and fetishes through behavioral cues
2. Look at their behavior, attitudes, how they treat you and other women
3. Bring focus to different parts of your body (tits, ass, face, lips, etc.) and observe their reactions
4. Ask questions that might illuminate these areas while not being obvious
      }
  }
  const addPrompt = (pr
      ...prompt,
    }

    }))

    setPrompts(current => {
      return rest
  }

    getPrompt,
    addPrompt,
  }

















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
    getPrompt,
    updatePrompt,
    addPrompt,
    deletePrompt
  }
}