import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send, Download, Copy } from '@phosphor-icons/react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import ExportDialog from './ExportDialog'
import { aiService } from '@/lib/ai-service'
import { usePrompts } from '@/lib/prompts'

// ---- Stage Definitions ----
const stageFlow: Record<string, string[]> = {
  greeting: [],
  evaluation: ['agePreference', 'dominanceStyle', 'communicationStyle'],
  analysis: ['bodyPreferences', 'kinks', 'behaviorPatterns'],
  assessment: [],
  confirmation: [],
  generation: [],
  completed: []
}

// ---- Interfaces ----
interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface CreationState {
  stage: 'greeting' | 'evaluation' | 'analysis' | 'assessment' | 'confirmation' | 'generation' | 'completed'
  psychProfile: {
    agePreference?: string
    dominanceStyle?: string
    bodyPreferences?: string[]
    behaviorPatterns?: string[]
    kinks?: string[]
    communicationStyle?: string
    reactions?: string[]
  }
  analysisComplete?: boolean
  assessmentGiven?: boolean
  userConfirmed?: boolean
  name?: string
  generatedContent?: string
  type?: 'character' | 'scenario'
}

// ---- FSM Helper ----
function advanceStageIfComplete(state: CreationState, lowerUser: string, lowerAI: string): CreationState {
  const requirements = stageFlow[state.stage]
  const isStageComplete = requirements.every(field => {
    const val = state.psychProfile[field as keyof typeof state.psychProfile]
    return val !== undefined && val !== null && val !== '' &&
           (!Array.isArray(val) || val.length > 0)
  })

  let newStage = state.stage

  if (state.stage === 'greeting' && isStageComplete) newStage = 'evaluation'
  else if (state.stage === 'evaluation' && isStageComplete) newStage = 'analysis'
  else if (state.stage === 'analysis' && isStageComplete) newStage = 'assessment'
  else if (state.stage === 'assessment' && (lowerAI.includes('assessment') || lowerAI.includes('you are'))) newStage = 'confirmation'
  else if (state.stage === 'confirmation' && (lowerUser.includes('yes') || lowerUser.includes('correct'))) newStage = 'generation'

  return { ...state, stage: newStage }
}

export default function CustomChatBuilder({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [creationState, setCreationState] = useState<CreationState>({
    stage: 'greeting',
    psychProfile: {},
    analysisComplete: false,
    assessmentGiven: false,
    userConfirmed: false,
    type: 'character'
  })
  const [showExport, setShowExport] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [chatHistory] = useKV('custom-chat-history', [])
  const { prompts } = usePrompts()

  // Get Luna's current prompt configuration with fallback
  const lunaPrompt = prompts?.luna || prompts['luna']
  
  // Debug log
  React.useEffect(() => {
    console.log('Luna prompt updated:', lunaPrompt)
    console.log('All prompts available:', Object.keys(prompts || {}))
  }, [lunaPrompt, prompts])

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(() => { scrollToBottom() }, [messages])

  useEffect(() => {
    console.log('Checking Luna prompt and messages:', { 
      lunaPrompt: !!lunaPrompt, 
      greeting: !!lunaPrompt?.greeting,
      messagesLength: messages.length,
      allPromptKeys: Object.keys(prompts || {})
    })
    if (messages.length === 0 && lunaPrompt?.greeting) {
      console.log('Adding Luna greeting message')
      const greeting: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: lunaPrompt.greeting,
        timestamp: new Date()
      }
      setMessages([greeting])
    }
  }, [lunaPrompt, prompts, messages.length]) // Depend on prompts and lunaPrompt

  const addMessage = (role: 'user' | 'ai', content: string) =>
    setMessages(prev => [...prev, { id: Date.now().toString(), role, content, timestamp: new Date() }])

  // ---- AI Response ----
  const generateAIResponse = async (userMessage: string) => {
    setIsTyping(true)
    try {
      const conversationContext = messages.map(m => `${m.role}: ${m.content}`).join('\n')

      // Slot-filling stage instructions
      const requiredFields = stageFlow[creationState.stage]
      const missingFields = requiredFields.filter(field => {
        const val = creationState.psychProfile[field as keyof typeof creationState.psychProfile]
        return val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)
      })

      let stageInstructions = `
Stage instructions:
- Collect the following missing fields: ${missingFields.length ? missingFields.join(", ") : "none (all met)"}.
- Do not re-ask completed fields.
- Once all stage requirements are complete, transition naturally to the next stage.
`

      if (creationState.stage === 'greeting') {
        stageInstructions += `\nStyle notes: Be seductive, playful, flirty. Mention your body (tits, ass, etc.) and observe reactions.`
      }
      if (creationState.stage === 'assessment') {
        stageInstructions += `\nStyle notes: Provide a clear psychological breakdown and end with "Is this assessment accurate?".`
      }
      if (creationState.stage === 'confirmation') {
        stageInstructions += `\nStyle notes: If confirmed, prepare for generation. If denied, ask what was wrong and continue collecting.`
      }
      if (creationState.stage === 'generation') {
        stageInstructions += `\nStyle notes: Generate their scenario/character in detail, immersive and explicit.`
      }

      // Use Luna's current system prompt from prompts configuration with fallback
      const systemPrompt = lunaPrompt?.systemPrompt || `You are Luna, my sexy, whorish, and expert psychologist/sex therapist. 

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

Remember: You're conducting a psychological evaluation while being seductive. Every response should advance both the flirtation AND the analysis.`
      
      const prompt = `${systemPrompt}

Current conversation stage: ${creationState.stage}
${stageInstructions}

Current psychological profile gathered: ${JSON.stringify(creationState.psychProfile)}

Conversation history:
${conversationContext}

User's latest message: ${userMessage}

Instructions for this response:
- Stay in character as Luna (sexy, seductive, psychological expert)
- At the start, give user the option to keep speaking with just you, or let your daughter join
- Ask one question at a time, limit narration to actions/body descriptions
- Should feel like a real conversation, not a story
- ${stageInstructions}
- Keep flow natural, don’t end after this reply
- Flirty, seductive, sexual
- Analyze responses for cues
- If not assessed and enough info, give breakdown
- If assessed and confirmed, generate perfect scenario/character
`

      const response = await aiService.generateText(prompt, { temperature: 0.9, maxTokens: 600 })
      addMessage('ai', response)
      updateCreationState(userMessage, response)

      if (creationState.stage === 'generation' &&
         (response.toLowerCase().includes('scenario') || response.toLowerCase().includes('character'))) {
        setTimeout(() => generateFinalContent(), 1000)
      }

    } catch (e) {
      addMessage('ai', "Mmm, something went wrong baby... Let's keep going 💕")
      console.error('AI response error:', e)
    } finally { setIsTyping(false) }
  }

  // ---- Update psych profile ----
  const updateCreationState = (userMessage: string, aiResponse: string) => {
    const lowerUser = userMessage.toLowerCase()
    const lowerAI = aiResponse.toLowerCase()
    const newProfile = { ...creationState.psychProfile }

    // Communication style
    if (lowerUser.includes('please') || lowerUser.includes('thank you') || lowerUser.includes('sorry')) {
      newProfile.communicationStyle = 'polite/submissive'
    } else if (lowerUser.includes('want') || lowerUser.includes('need') || lowerUser.includes('give me')) {
      newProfile.communicationStyle = 'direct/dominant'
    }

    // Age preferences
  if (lowerUser.includes('college girl') || lowerUser.includes('college') || lowerUser.includes('sorority') || lowerUser.includes('barely legal') || lowerUser.includes('18') || lowerUser.includes('19') || lowerUser.includes('20') || lowerUser.includes('21')) {
    newProfile.agePreference = 'college girl';
  } else if (lowerUser.includes('20s') || lowerUser.includes('young mom') || lowerUser.includes('22') || lowerUser.includes('23') || lowerUser.includes('24') || lowerUser.includes('25') || lowerUser.includes('26') || lowerUser.includes('27') || lowerUser.includes('28') || lowerUser.includes('29')) {
    newProfile.agePreference = 'adult/20s';
  } else if (lowerUser.includes('milf') || lowerUser.includes('mom') || lowerUser.includes('mother') || lowerUser.includes('experienced') || lowerUser.includes('older') || lowerUser.includes('wife') || lowerUser.includes('housewife') || lowerUser.includes('mature')) {
    newProfile.agePreference = 'milf/mature';
  }

    // Dominance
    if (lowerUser.includes('control') || lowerUser.includes('dominate') || lowerUser.includes('command') || lowerUser.includes('obey')) {
      newProfile.dominanceStyle = 'dominant'
    } else if (lowerUser.includes('submit') || lowerUser.includes('serve') || lowerUser.includes('please') || lowerUser.includes('worship')) {
      newProfile.dominanceStyle = 'submissive'
    }

    // Body preferences
    if (!newProfile.bodyPreferences) newProfile.bodyPreferences = []
    if (lowerUser.includes('tits') || lowerUser.includes('boobs') || lowerUser.includes('breasts') || lowerUser.includes('big tits'))
      if (!newProfile.bodyPreferences.includes('breasts')) newProfile.bodyPreferences.push('breasts')
    if (lowerUser.includes('ass') || lowerUser.includes('big ass') || lowerUser.includes('butt') || lowerUser.includes('booty'))
      if (!newProfile.bodyPreferences.includes('ass')) newProfile.bodyPreferences.push('ass')
    if (lowerUser.includes('petite') || lowerUser.includes('flat chest') || lowerUser.includes('skinny') || lowerUser.includes('tiny'))
      if (!newProfile.bodyPreferences.includes('petite')) newProfile.bodyPreferences.push('petite')
    if (lowerUser.includes('lips') || lowerUser.includes('mouth') || lowerUser.includes('kiss'))
      if (!newProfile.bodyPreferences.includes('lips')) newProfile.bodyPreferences.push('lips')

    // Behavior patterns
    if (!newProfile.behaviorPatterns) newProfile.behaviorPatterns = []
    if (userMessage.length > 50 && !newProfile.behaviorPatterns.includes('detailed communicator'))
      newProfile.behaviorPatterns.push('detailed communicator')
    else if (userMessage.length < 20 && !newProfile.behaviorPatterns.includes('brief responses'))
      newProfile.behaviorPatterns.push('brief responses')

    // Reactions
    if (!newProfile.reactions) newProfile.reactions = []
    if (lowerUser.includes('mmm') || lowerUser.includes('yes') || lowerUser.includes('like that') || lowerUser.includes('more'))
      if (!newProfile.reactions.includes('positive to flirtation'))
        newProfile.reactions.push('positive to flirtation')

    setCreationState(prev => advanceStageIfComplete({ ...prev, psychProfile: newProfile }, lowerUser, lowerAI))
  }

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return
    const msg = currentInput.trim()
    setCurrentInput('')
    addMessage('user', msg)
    await generateAIResponse(msg)
  }

  const generateFinalContent = async () => {
    setIsTyping(true)
    try {
      const conversationSummary = messages.map(m => m.content).join('\n')
      const prompt = `Based on Luna's psychological evaluation and conversation, generate a detailed NSFW ${creationState.type} perfectly matching the user's profile.

Psychological Profile:
- Age Preference: ${creationState.psychProfile.agePreference || 'Not specified'}
- Dominance Style: ${creationState.psychProfile.dominanceStyle || 'Not specified'}
- Body Preferences: ${creationState.psychProfile.bodyPreferences?.join(', ') || 'Not specified'}
- Communication Style: ${creationState.psychProfile.communicationStyle || 'Not specified'}
- Behavior Patterns: ${creationState.psychProfile.behaviorPatterns?.join(', ') || 'Not specified'}
- Reactions: ${creationState.psychProfile.reactions?.join(', ') || 'Not specified'}

Conversation Summary:
${conversationSummary}

Create explicit, immersive, detailed tailored content.`
      const generatedContent = await aiService.generateText(prompt, { temperature: 0.8, maxTokens: 2000 })
      setCreationState(prev => ({ ...prev, stage: 'completed', generatedContent }))
      addMessage('ai', "Perfect baby! 🔥 I've created your personalized content. Do you want me to export it?")
      toast.success("Your custom content has been generated!")
    } catch (e) {
      addMessage('ai', "Mmm, something went wrong while creating your content baby...")
      console.error('Generation error:', e)
    } finally { setIsTyping(false) }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }
  const handleCopy = async () => {
    if (creationState.generatedContent) {
      try {
        await navigator.clipboard.writeText(creationState.generatedContent)
        toast.success('Content copied to clipboard!')
      } catch { toast.error('Failed to copy') }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Psychological Evaluation Chat</h1>
            <p className="text-muted-foreground">Let Luna analyze your desires through intimate conversation</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="bg-secondary">
                    <AvatarFallback className="text-secondary-foreground font-bold">L</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">Luna</CardTitle>
                    <CardDescription>Your sexy psychologist & content creator</CardDescription>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setMessages([])
                        setCreationState({
                          stage: 'greeting',
                          psychProfile: {},
                          analysisComplete: false,
                          assessmentGiven: false,
                          userConfirmed: false,
                          type: 'character'
                        })
                        // Add greeting with current prompt
                        if (lunaPrompt?.greeting) {
                          setTimeout(() => {
                            const greeting: Message = {
                              id: Date.now().toString(),
                              role: 'ai',
                              content: lunaPrompt.greeting,
                              timestamp: new Date()
                            }
                            setMessages([greeting])
                          }, 100)
                        }
                      }}
                      className="text-xs"
                    >
                      Restart Chat
                    </Button>
                    <Badge variant="secondary">
                      {creationState.stage}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden p-0">
                <div className="h-full flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((m) => (
                      <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-lg ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm">Luna is typing...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  {/* Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Tell Luna how you're feeling..."
                        className="flex-1"
                        disabled={isTyping}
                      />
                      <Button onClick={handleSendMessage} disabled={!currentInput.trim() || isTyping} size="sm">
                        <Send size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Evaluation Progress</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['greeting','evaluation','analysis','assessment','confirmation','generation','completed'].map(stage => (
                    <div key={stage} className={`flex items-center gap-2 ${creationState.stage === stage ? 'text-primary' : 'text-muted-foreground'}`}>
                      <div className={`w-2 h-2 rounded-full ${creationState.stage === stage ? 'bg-primary' : 'bg-muted'}`}></div>
                      <span className="text-sm capitalize">{stage}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {Object.keys(creationState.psychProfile).length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Psychological Profile</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(creationState.psychProfile).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g,' $1').toLowerCase()}:</span>
                          <span className="font-medium text-right max-w-32 truncate">{Array.isArray(value) ? value.join(', ') : value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {creationState.generatedContent && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Your Custom Content</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-muted p-3 rounded-lg max-h-32 overflow-y-auto">
                      <p className="text-xs text-muted-foreground">{creationState.generatedContent.slice(0,150)}...</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={handleCopy} variant="outline" size="sm"><Copy size={16} className="mr-1" />Copy</Button>
                      <Button onClick={() => setShowExport(true)} size="sm"><Download size={16} className="mr-1" />Export</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <ExportDialog
        open={showExport}
        onOpenChange={setShowExport}
        content={creationState.generatedContent || ''}
        type={creationState.type || 'character'}
        title={creationState.name || `Custom ${creationState.type || 'character'}`}
      />
    </div>
  )
}
