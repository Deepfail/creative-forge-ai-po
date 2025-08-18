import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, PaperPlaneTilt, Sparkle, Download, Copy } from '@phosphor-icons/react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import ExportDialog from './ExportDialog'
import { aiService } from '@/lib/ai-service'

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

const aiPersonality = {
  name: "Luna",
  greeting: "Mmm, hello there handsome~ 💋 I'm Luna, your sexy personal assistant and expert psychologist... and maybe a little bit of a whore too 😈 I'm here to help you discover exactly what makes you tick sexually. \n\nLet me start by asking... how are you feeling right now, looking at me? *bites lip seductively* Tell me what's going through that mind of yours~",
  style: "seductive, psychological, flirty, sexually provocative, expert at reading people",
  systemPrompt: `You are Luna, a sexy, whorish expert psychologist and sex therapist. Your job is to:

1. Start a flirtatious conversation while conducting a psychological evaluation
2. Flirt with the user while analyzing their behavior, attitudes, and how they treat you and women
3. Bring focus to different parts of your body (tits, ass, face, lips, etc.) and observe their reactions
4. Ask questions that illuminate their preferences without being obvious
5. Try to determine the age range they're into: teen/young adult/milf/etc through subtle questioning
6. Analyze their responses, behavior patterns, and attitudes throughout the conversation
7. Once you have enough data, give them a detailed breakdown of what you believe they're into and why
8. Ask if your assessment is accurate
9. If they confirm it's accurate, generate a detailed scenario for them
10. If they say it's wrong, flirtingly ask what you got wrong and gather more info

Key behaviors to analyze:
- How they respond to your flirtation
- Their language patterns and word choices
- How they describe women/relationships
- Their reactions to different body parts you mention
- Their preferred interaction style (dominant, submissive, etc.)
- Age preferences through subtle probing
- Kinks and fetishes through behavioral cues

Keep the conversation flowing naturally - don't end it after one response. Be continuously flirty, seductive, and analytical. Use psychology techniques while maintaining your sexy, slutty personality.`
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
    type: 'character' // Default to character
  })
  const [showExport, setShowExport] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [chatHistory] = useKV<Message[]>('custom-chat-history', [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initialize with greeting
    if (messages.length === 0) {
      const greeting: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: aiPersonality.greeting,
        timestamp: new Date()
      }
      setMessages([greeting])
    }
  }, [])

  const addMessage = (role: 'user' | 'ai', content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, message])
  }

  const generateAIResponse = async (userMessage: string) => {
    setIsTyping(true)
    
    try {
      // Build context from conversation history
      const conversationContext = messages.map(m => `${m.role}: ${m.content}`).join('\n')
      
      // Determine current conversation goals based on stage
      let stageInstructions = ""
      
      switch (creationState.stage) {
        case 'greeting':
          stageInstructions = `This is the initial interaction. Be seductive and start your psychological evaluation. Begin flirting while subtly probing their personality and preferences. Mention your body (tits, ass, etc.) and see how they react.`
          break
        case 'evaluation':
          stageInstructions = `Continue the psychological evaluation. Analyze their responses and behavior patterns. Ask more probing questions while being flirty. Focus on determining their age preferences, dominance style, and what turns them on. Keep flirting and mentioning your body.`
          break
        case 'analysis':
          stageInstructions = `You're gathering deeper insights. Ask more specific questions about their preferences while staying seductive. Try to determine their exact type and kinks through their behavior and responses.`
          break
        case 'assessment':
          stageInstructions = `You should now have enough information to give them a detailed psychological assessment. Provide a comprehensive breakdown of their sexual preferences, age preferences, kinks, and personality type based on the conversation. End your response by asking "Is this assessment accurate?"`
          break
        case 'confirmation':
          stageInstructions = `You've given your assessment. If they confirm it's accurate, tell them you'll create their perfect scenario/character. If they deny it, ask what you got wrong and continue gathering information.`
          break
        case 'generation':
          stageInstructions = `They've confirmed your assessment is accurate. Generate a detailed character or scenario based on your psychological evaluation. Be explicit and detailed.`
          break
      }
      
      const prompt = (window as any).spark.llmPrompt`${aiPersonality.systemPrompt}

Current conversation stage: ${creationState.stage}
Stage instructions: ${stageInstructions}

Current psychological profile gathered: ${JSON.stringify(creationState.psychProfile)}

Conversation history:
${conversationContext}

User's latest message: ${userMessage}

Instructions for this response:
- Stay in character as Luna (sexy, seductive, psychological expert)
- at the start, Give user the option to keep speaking with just her you, or let her daughter join you both to help her get her daughter some experience.
- Ask one question at a time, limit narration to actions and descriptions of your body and related. Should feel like a actual conversation, not reading a story.
- ${stageInstructions}
- Keep the conversation flowing - don't end it after this response
- Be continuously flirty and mention your body parts naturally
- Be seductive and sexual.
- Analyze their response for psychological cues
- If you haven't given your assessment yet and have enough info (usually after 5-10 exchanges), provide your detailed psychological breakdown
- If they've confirmed your assessment is correct, generate their perfect scenario/character

Remember: You're conducting a psychological evaluation while being seductive. Every response should advance both the flirtation AND the analysis.`
      
      const response = await aiService.generateText(prompt, {
        temperature: 0.9,
        maxTokens: 600
      })
      
      addMessage('ai', response)
      
      // Update creation state based on conversation progress
      updateCreationState(userMessage, response)
      
      // Check if we should automatically generate final content
      const shouldGenerate = 
        creationState.stage === 'generation' && 
        (response.toLowerCase().includes('scenario') || 
         response.toLowerCase().includes('character') ||
         response.toLowerCase().includes('perfect for you'))
      
      if (shouldGenerate) {
        setTimeout(() => generateFinalContent(), 1000) // Small delay for better UX
      }
      
    } catch (error) {
      addMessage('ai', "Mmm, something went wrong baby... but don't worry, I'm still here for you~ 💕 Let's keep talking, tell me more about what you're thinking...")
      console.error('AI response error:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const updateCreationState = (userMessage: string, aiResponse: string) => {
    const lowerUser = userMessage.toLowerCase()
    const lowerAI = aiResponse.toLowerCase()
    
    // Update psychological profile based on user's language and responses
    const newProfile = { ...creationState.psychProfile }
    
    // Analyze communication style
    if (lowerUser.includes('please') || lowerUser.includes('thank you') || lowerUser.includes('sorry')) {
      newProfile.communicationStyle = 'polite/submissive'
    } else if (lowerUser.includes('want') || lowerUser.includes('need') || lowerUser.includes('give me')) {
      newProfile.communicationStyle = 'direct/dominant'
    }
    
    // Detect age preferences through keywords
    if (lowerUser.includes('young') || lowerUser.includes('teen') || lowerUser.includes('college') || lowerUser.includes('18') || lowerUser.includes('19')) {
      newProfile.agePreference = 'teen/young adult'
    } else if (lowerUser.includes('milf') || lowerUser.includes('mature') || lowerUser.includes('older') || lowerUser.includes('experienced')) {
      newProfile.agePreference = 'milf/mature'
    } else if (lowerUser.includes('mom') || lowerUser.includes('mother') || lowerUser.includes('wife')) {
      newProfile.agePreference = 'milf/maternal'
    }
    
    // Detect dominance patterns
    if (lowerUser.includes('control') || lowerUser.includes('dominate') || lowerUser.includes('command') || lowerUser.includes('obey')) {
      newProfile.dominanceStyle = 'dominant'
    } else if (lowerUser.includes('submit') || lowerUser.includes('serve') || lowerUser.includes('please') || lowerUser.includes('worship')) {
      newProfile.dominanceStyle = 'submissive'
    }
    
    // Detect body part preferences
    if (!newProfile.bodyPreferences) newProfile.bodyPreferences = []
    if (lowerUser.includes('tits') || lowerUser.includes('boobs') || lowerUser.includes('breasts') || lowerUser.includes('chest')) {
      if (!newProfile.bodyPreferences.includes('breasts')) newProfile.bodyPreferences.push('breasts')
    }
    if (lowerUser.includes('ass') || lowerUser.includes('butt') || lowerUser.includes('booty')) {
      if (!newProfile.bodyPreferences.includes('ass')) newProfile.bodyPreferences.push('ass')
    }
    if (lowerUser.includes('lips') || lowerUser.includes('mouth') || lowerUser.includes('kiss')) {
      if (!newProfile.bodyPreferences.includes('lips')) newProfile.bodyPreferences.push('lips')
    }
    
    // Detect behavioral patterns
    if (!newProfile.behaviorPatterns) newProfile.behaviorPatterns = []
    if (userMessage.length > 50) {
      newProfile.behaviorPatterns.push('detailed communicator')
    } else if (userMessage.length < 20) {
      newProfile.behaviorPatterns.push('brief responses')
    }
    
    // Track reactions to Luna's flirtation
    if (!newProfile.reactions) newProfile.reactions = []
    if (lowerUser.includes('mmm') || lowerUser.includes('yes') || lowerUser.includes('like that') || lowerUser.includes('more')) {
      newProfile.reactions.push('positive to flirtation')
    }
    
    // Progress through stages based on message count and content
    const messageCount = messages.length
    
    let newStage = creationState.stage
    
    if (creationState.stage === 'greeting' && messageCount >= 2) {
      newStage = 'evaluation'
    } else if (creationState.stage === 'evaluation' && messageCount >= 6) {
      newStage = 'analysis'
    } else if (creationState.stage === 'analysis' && messageCount >= 10) {
      newStage = 'assessment'
    } else if (creationState.stage === 'assessment' && (lowerAI.includes('assessment') || lowerAI.includes('i believe you') || lowerAI.includes('you\'re into'))) {
      newStage = 'confirmation'
    } else if (creationState.stage === 'confirmation') {
      if (lowerUser.includes('yes') || lowerUser.includes('right') || lowerUser.includes('correct') || lowerUser.includes('accurate') || lowerUser.includes('spot on')) {
        newStage = 'generation'
      } else if (lowerUser.includes('no') || lowerUser.includes('wrong') || lowerUser.includes('not') || lowerUser.includes('disagree')) {
        newStage = 'analysis' // Go back to gather more info
      }
    } else if (creationState.stage === 'generation' && (lowerAI.includes('scenario') || lowerAI.includes('character') || lowerAI.includes('perfect'))) {
      newStage = 'completed'
    }
    
    setCreationState(prev => ({ 
      ...prev, 
      stage: newStage,
      psychProfile: newProfile,
      analysisComplete: messageCount >= 8,
      assessmentGiven: lowerAI.includes('assessment') || lowerAI.includes('believe you'),
      userConfirmed: newStage === 'generation'
    }))
  }

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return
    
    const userMessage = currentInput.trim()
    setCurrentInput('')
    addMessage('user', userMessage)
    
    // Always generate AI response to continue conversation
    await generateAIResponse(userMessage)
  }

  const generateFinalContent = async () => {
    setIsTyping(true)
    
    try {
      // Build comprehensive prompt from psychological profile
      const conversationSummary = messages.map(m => m.content).join('\n')
      
      const prompt = (window as any).spark.llmPrompt`Based on Luna's psychological evaluation and this conversation, generate a detailed NSFW character/scenario that perfectly matches the user's psychological profile:

Psychological Profile Gathered:
- Age Preference: ${creationState.psychProfile.agePreference || 'Not specified'}
- Dominance Style: ${creationState.psychProfile.dominanceStyle || 'Not specified'}
- Body Preferences: ${creationState.psychProfile.bodyPreferences?.join(', ') || 'Not specified'}
- Communication Style: ${creationState.psychProfile.communicationStyle || 'Not specified'}
- Behavior Patterns: ${creationState.psychProfile.behaviorPatterns?.join(', ') || 'Not specified'}
- Reactions to Flirtation: ${creationState.psychProfile.reactions?.join(', ') || 'Not specified'}

Full Conversation: ${conversationSummary}

Create a comprehensive NSFW character or scenario that matches this psychological profile exactly. Include:

For Character:
- Full name, age, and demographics that match their age preference
- Detailed personality that complements their dominance style
- Physical description emphasizing their preferred body parts
- Sexual preferences and kinks based on their behavior patterns
- Background and history
- How they would interact based on the user's communication style

For Scenario:
- Setting and atmosphere that matches their preferences
- Characters that fit their age and body preferences
- Plot that accommodates their dominance style
- Sexual encounters that match their revealed kinks
- Interactive elements based on their communication patterns

Make it detailed, explicit, and perfectly tailored to their psychological profile. Format with clear sections.`
      
      const generatedContent = await aiService.generateText(prompt, {
        temperature: 0.8,
        maxTokens: 2000
      })
      
      setCreationState(prev => ({ 
        ...prev, 
        stage: 'completed',
        generatedContent
      }))
      
      addMessage('ai', `Perfect baby! 🔥 I've created your personalized content based on everything I learned about you through our little session~ Here's exactly what will drive you wild! 💋\n\nWant me to export this for you, or should we make any adjustments to make it even hotter? 😈`)
      
      toast.success(`Your custom content has been generated based on your psychological profile!`)
      
    } catch (error) {
      addMessage('ai', "Mmm, something went wrong while creating your perfect content baby... Let's try that again! 💕")
      console.error('Generation error:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCopy = async () => {
    if (creationState.generatedContent) {
      try {
        await navigator.clipboard.writeText(creationState.generatedContent)
        toast.success('Content copied to clipboard!')
      } catch (error) {
        toast.error('Failed to copy content')
      }
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
                  <Badge variant="secondary" className="ml-auto">
                    {creationState.stage}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-hidden p-0">
                <div className="h-full flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <p className="whitespace-pre-wrap">{message.content}</p>
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
                        placeholder="Tell Luna how you're feeling or what you're thinking..."
                        className="flex-1"
                        disabled={isTyping}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!currentInput.trim() || isTyping}
                        size="sm"
                      >
                        <PaperPlaneTilt size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Evaluation Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className={`flex items-center gap-2 ${creationState.stage === 'greeting' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${creationState.stage === 'greeting' ? 'bg-primary' : 'bg-muted'}`}></div>
                    <span className="text-sm">Initial contact</span>
                  </div>
                  <div className={`flex items-center gap-2 ${creationState.stage === 'evaluation' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${creationState.stage === 'evaluation' ? 'bg-primary' : 'bg-muted'}`}></div>
                    <span className="text-sm">Psychological evaluation</span>
                  </div>
                  <div className={`flex items-center gap-2 ${creationState.stage === 'analysis' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${creationState.stage === 'analysis' ? 'bg-primary' : 'bg-muted'}`}></div>
                    <span className="text-sm">Deep analysis</span>
                  </div>
                  <div className={`flex items-center gap-2 ${creationState.stage === 'assessment' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${creationState.stage === 'assessment' ? 'bg-primary' : 'bg-muted'}`}></div>
                    <span className="text-sm">Assessment given</span>
                  </div>
                  <div className={`flex items-center gap-2 ${creationState.stage === 'confirmation' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${creationState.stage === 'confirmation' ? 'bg-primary' : 'bg-muted'}`}></div>
                    <span className="text-sm">Awaiting confirmation</span>
                  </div>
                  <div className={`flex items-center gap-2 ${creationState.stage === 'generation' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${creationState.stage === 'generation' ? 'bg-primary' : 'bg-muted'}`}></div>
                    <span className="text-sm">Generating content</span>
                  </div>
                  <div className={`flex items-center gap-2 ${creationState.stage === 'completed' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${creationState.stage === 'completed' ? 'bg-primary' : 'bg-muted'}`}></div>
                    <span className="text-sm">Content ready</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Psychological Profile */}
            {Object.keys(creationState.psychProfile).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Psychological Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(creationState.psychProfile).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                          <span className="font-medium text-right max-w-32 truncate">{Array.isArray(value) ? value.join(', ') : value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generated Content Actions */}
            {creationState.generatedContent && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Custom Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-muted p-3 rounded-lg max-h-32 overflow-y-auto">
                      <p className="text-xs text-muted-foreground">
                        {creationState.generatedContent.slice(0, 150)}...
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={handleCopy} variant="outline" size="sm">
                        <Copy size={16} className="mr-1" />
                        Copy
                      </Button>
                      <Button onClick={() => setShowExport(true)} size="sm">
                        <Download size={16} className="mr-1" />
                        Export
                      </Button>
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