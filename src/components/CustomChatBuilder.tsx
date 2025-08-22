import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send, Download, Copy } from '@phosphor-icons/react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import ExportDialog from './ExportDialog'
import { aiService } from '@/lib/ai-service'
import { usePrompts } from '@/lib/prompts'

// ---- Interfaces ----
interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface CreationState {
  preferences: {
    characterType?: string
    scenarioType?: string
    style?: string
    themes?: string[]
    setting?: string
  }
  generatedContent?: string
  type: 'character' | 'scenario'
}

export default function CustomChatBuilder({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [creationState, setCreationState] = useState<CreationState>({
    preferences: {},
    type: 'character'
  })
  const [showExport, setShowExport] = useState(false)
  const [promptRefreshKey, setPromptRefreshKey] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { getPrompt, getChatBuilderPrompt, forceClear, resetToDefaults } = usePrompts()

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(() => { scrollToBottom() }, [messages])

  // Force refresh prompts and restart chat
  const refreshPrompts = () => {
    setPromptRefreshKey(prev => prev + 1)
    // Reset the chat when prompts are refreshed
    setMessages([])
    // Force clear the cached prompts to reload fresh from storage
    window.location.reload() // Simple but effective way to ensure fresh prompt load
    console.log('Refreshing prompts in chat builder and restarting chat')
  }

  // Clear chat and restart with new prompts
  const restartChat = () => {
    setMessages([])
    setCreationState({
      preferences: {},
      type: 'character'
    })
    toast.success('Chat restarted with updated prompts')
  }

  useEffect(() => {
    if (messages.length === 0) {
      // Get Luna's greeting from the prompts system
      const lunaPrompt = getPrompt('luna-chat-builder')
      
      console.log('Initializing chat with Luna prompt:', lunaPrompt?.name || 'fallback')
      console.log('Luna greeting available:', !!lunaPrompt?.greeting)
      console.log('Luna system prompt available:', !!lunaPrompt?.systemPrompt)
      console.log('Luna system prompt preview:', lunaPrompt?.systemPrompt?.substring(0, 200) + '...')
      
      const greeting: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: lunaPrompt?.greeting || "Hey there! 💋 I'm Ali, your AI assistant for creating custom characters and scenarios.\n\nI specialize in helping you design exactly what you're looking for through our conversation. Just tell me what kind of character or scenario you have in mind, and I'll guide you through creating something perfect!\n\nWhat would you like to create today?",
        timestamp: new Date()
      }
      setMessages([greeting])
    }
  }, [messages.length, getPrompt, promptRefreshKey])

  const addMessage = (role: 'user' | 'ai', content: string) =>
    setMessages(prev => [...prev, { id: Date.now().toString(), role, content, timestamp: new Date() }])

  // ---- AI Response ----
  const generateAIResponse = async (userMessage: string) => {
    setIsTyping(true)
    try {
      const conversationContext = messages.map(m => `${m.role}: ${m.content}`).join('\n')
      
      // Get Luna's system prompt using the hook function - always get fresh from storage
      const systemPrompt = getChatBuilderPrompt()
      
      console.log('Using system prompt for AI response (fresh from storage)')
      console.log('System prompt length:', systemPrompt.length)
      console.log('System prompt preview:', systemPrompt.substring(0, 200) + '...')

      // Use cleaner, less explicit prompt to avoid content filtering
      const prompt = `Context: ${systemPrompt}

Previous conversation:
${conversationContext}

Latest user message: ${userMessage}

Instructions: Continue as Luna, the seductive assistant. Keep responses conversational (1-3 sentences). Ask follow-up questions. Stay in character. Keep the conversation flowing.`

      const response = await aiService.generateText(prompt, { 
        temperature: 0.8, 
        maxTokens: 400
      })
      addMessage('ai', response)
      updatePreferences(userMessage, response)

      // Check if user seems ready for generation
      if (userMessage.toLowerCase().includes('generate') || 
          userMessage.toLowerCase().includes('create') || 
          userMessage.toLowerCase().includes('make it') ||
          response.toLowerCase().includes('shall i create')) {
        setTimeout(() => generateFinalContent(), 1000)
      }

    } catch (e) {
      console.error('AI response error:', e)
      // More graceful error handling
      const errorMsg = e.toString().toLowerCase()
      if (errorMsg.includes('content_filter') || errorMsg.includes('responsibleai')) {
        addMessage('ai', "Let's keep our conversation a bit lighter... What kind of character interests you? 😊")
      } else if (errorMsg.includes('api key') || errorMsg.includes('unauthorized')) {
        addMessage('ai', "Looks like there's an API issue. Want to continue our chat while we figure that out? 💋")
      } else {
        addMessage('ai', "Something went wrong on my end... but I'm still here for you! What were we talking about? 😘")
      }
    } finally { setIsTyping(false) }
  }

  // ---- Update preferences ----
  const updatePreferences = (userMessage: string, aiResponse: string) => {
    const lowerUser = userMessage.toLowerCase()
    const newPreferences = { ...creationState.preferences }

    // Extract preferences from user message
    if (lowerUser.includes('character')) {
      setCreationState(prev => ({ ...prev, type: 'character' }))
    } else if (lowerUser.includes('scenario') || lowerUser.includes('scene')) {
      setCreationState(prev => ({ ...prev, type: 'scenario' }))
    }

    // Character types
    if (lowerUser.includes('milf') || lowerUser.includes('mature')) {
      newPreferences.characterType = 'milf'
    } else if (lowerUser.includes('college') || lowerUser.includes('student')) {
      newPreferences.characterType = 'college'
    } else if (lowerUser.includes('cheerleader')) {
      newPreferences.characterType = 'cheerleader'
    } else if (lowerUser.includes('teacher') || lowerUser.includes('professor')) {
      newPreferences.characterType = 'teacher'
    }

    // Settings
    if (lowerUser.includes('office') || lowerUser.includes('workplace')) {
      newPreferences.setting = 'office'
    } else if (lowerUser.includes('school') || lowerUser.includes('classroom')) {
      newPreferences.setting = 'school'
    } else if (lowerUser.includes('home') || lowerUser.includes('house')) {
      newPreferences.setting = 'home'
    } else if (lowerUser.includes('public')) {
      newPreferences.setting = 'public'
    }

    // Themes
    if (!newPreferences.themes) newPreferences.themes = []
    if (lowerUser.includes('dominant') && !newPreferences.themes.includes('dominant')) {
      newPreferences.themes.push('dominant')
    }
    if (lowerUser.includes('submissive') && !newPreferences.themes.includes('submissive')) {
      newPreferences.themes.push('submissive')
    }
    if (lowerUser.includes('romantic') && !newPreferences.themes.includes('romantic')) {
      newPreferences.themes.push('romantic')
    }
    if (lowerUser.includes('rough') && !newPreferences.themes.includes('rough')) {
      newPreferences.themes.push('rough')
    }

    setCreationState(prev => ({ ...prev, preferences: newPreferences }))
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
      
      // Use a more generic prompt to avoid content filtering
      const prompt = `Create a detailed ${creationState.type} based on this conversation summary. 

Preferences:
- Character Type: ${creationState.preferences.characterType || 'Not specified'}
- Setting: ${creationState.preferences.setting || 'Not specified'}
- Style: ${creationState.preferences.style || 'Not specified'}
- Themes: ${creationState.preferences.themes?.join(', ') || 'Not specified'}

Conversation Summary:
${conversationSummary}

Create engaging, detailed content tailored to their interests. Include personality, background, and interaction style.`
      
      const generatedContent = await aiService.generateText(prompt, { 
        temperature: 0.8, 
        maxTokens: 2000
      })
      setCreationState(prev => ({ ...prev, generatedContent }))
      addMessage('ai', "Perfect! I've created your personalized content. Would you like me to export it for you?")
      toast.success("Your custom content has been generated!")
    } catch (e) {
      console.error('Generation error:', e)
      const errorMsg = e.toString().toLowerCase()
      if (errorMsg.includes('content_filter') || errorMsg.includes('responsibleai')) {
        addMessage('ai', "Let me create something more general for you. What specific type of character are you interested in?")
      } else {
        addMessage('ai', "Something went wrong while creating your content. Let's try again with a different approach.")
      }
    } finally { setIsTyping(false) }
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
      } catch { 
        toast.error('Failed to copy') 
      }
    }
  }

  const handleRestart = () => {
    setMessages([])
    setCreationState({
      preferences: {},
      type: 'character'
    })
    // Force refresh prompts and add greeting after state reset
    refreshPrompts()
    setTimeout(() => {
      const lunaPrompt = getPrompt('luna-chat-builder')
      const greeting: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: lunaPrompt?.greeting || "Hey there! 💋 I'm Luna, your AI assistant for creating custom characters and scenarios.\n\nI specialize in helping you design exactly what you're looking for through our conversation. Just tell me what kind of character or scenario you have in mind, and I'll guide you through creating something perfect!\n\nWhat would you like to create today?",
        timestamp: new Date()
      }
      setMessages([greeting])
    }, 100)
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
            <h1 className="text-3xl font-bold">Custom Content Builder</h1>
            <p className="text-muted-foreground">Chat with AI to create personalized NSFW content</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="bg-primary">
                    <AvatarFallback className="text-primary-foreground font-bold">AI</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">AI Assistant</CardTitle>
                    <CardDescription>Custom content creator</CardDescription>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        console.log('Force resetting prompts to defaults...')
                        resetToDefaults()
                        setTimeout(() => window.location.reload(), 100)
                      }}
                      className="text-xs"
                      title="Reset to defaults and refresh"
                    >
                      🔄 Reset Ali
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={refreshPrompts}
                      className="text-xs"
                      title="Refresh AI prompts"
                    >
                      🔄 Refresh
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={restartChat}
                      className="text-xs"
                    >
                      Restart Chat
                    </Button>
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
                            <span className="text-sm">AI is typing...</span>
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
                        placeholder="Describe what you'd like to create..."
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
              <CardHeader><CardTitle className="text-lg">Content Type</CardTitle></CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="text-muted-foreground">Creating: <span className="text-foreground font-medium capitalize">{creationState.type}</span></p>
                </div>
              </CardContent>
            </Card>

            {Object.keys(creationState.preferences).length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Preferences</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(creationState.preferences).map(([key, value]) => (
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
                <CardHeader><CardTitle className="text-lg">Generated Content</CardTitle></CardHeader>
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
        title={`Custom ${creationState.type || 'character'}`}
      />
    </div>
  )
}