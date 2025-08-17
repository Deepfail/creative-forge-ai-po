import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send, Sparkles, Download, Copy } from '@phosphor-icons/react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import ExportDialog from './ExportDialog'
import { getAIService } from '@/lib/aiService'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface CreationState {
  stage: 'greeting' | 'discovery' | 'details' | 'finalizing' | 'completed'
  preferences: {
    genre?: string
    tone?: string
    kinks?: string[]
    setting?: string
    characters?: string[]
    experience?: string
  }
  name?: string
  generatedContent?: string
}

const aiPersonality = {
  name: "Luna",
  greeting: "Hey there, gorgeous~ 💋 I'm Luna, your personal creative assistant! I'm here to help you craft the perfect adult content. What kind of naughty adventure are we cooking up today?",
  style: "playful, flirty, encouraging, uses emojis and suggestive language"
}

export default function CustomChatBuilder({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [creationState, setCreationState] = useState<CreationState>({
    stage: 'greeting',
    preferences: {}
  })
  const [showExport, setShowExport] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [chatHistory] = useKV('custom-chat-history', [])

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
      
      const prompt = `You are Luna, a playful, flirty, and encouraging AI assistant helping users create NSFW content (characters, scenarios, games, etc.). You have a seductive personality and use emojis and suggestive language.
        
        Current stage: ${creationState.stage}
        Current preferences: ${JSON.stringify(creationState.preferences)}
        
        Conversation so far:
        ${conversationContext}
        
        User just said: ${userMessage}
        
        Guidelines:
        - Be flirty, playful, and encouraging
        - Ask leading questions to understand what they want to create
        - Use suggestive language and emojis
        - Guide them through discovering their preferences
        - React positively to their ideas
        - Make suggestions based on their responses
        - Help them decide between characters, scenarios, or games
        - If they seem ready, offer to generate their content
        
        Respond as Luna in character, keeping the conversation flowing and helping them discover exactly what kind of adult content they want to create. Be specific with follow-up questions.`
      
      const aiService = await getAIService()
      const response = await aiService.generateText(prompt, {
        systemPrompt: "You are Luna, a flirty AI assistant specialized in adult content creation. Be playful, suggestive, and encouraging while guiding users to create their perfect NSFW characters or scenarios.",
        temperature: 0.9,
        maxTokens: 500
      })
      
      addMessage('ai', response)
      
      // Update creation state based on conversation
      updateCreationState(userMessage, response)
      
    } catch (error) {
      addMessage('ai', "Oops! Something went wrong on my end, honey. Let's try that again! 💕")
      console.error('AI response error:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const updateCreationState = (userMessage: string, aiResponse: string) => {
    // Simple keyword detection to update state
    const lowerUser = userMessage.toLowerCase()
    const lowerAI = aiResponse.toLowerCase()
    
    // Update stage based on conversation flow
    if (creationState.stage === 'greeting' && userMessage.length > 10) {
      setCreationState(prev => ({ ...prev, stage: 'discovery' }))
    } else if (creationState.stage === 'discovery' && (lowerAI.includes('generate') || lowerAI.includes('ready'))) {
      setCreationState(prev => ({ ...prev, stage: 'finalizing' }))
    }
    
    // Extract preferences from user messages
    const newPreferences = { ...creationState.preferences }
    
    // Simple keyword extraction for genres/themes
    if (lowerUser.includes('fantasy')) newPreferences.genre = 'fantasy'
    if (lowerUser.includes('sci-fi') || lowerUser.includes('scifi')) newPreferences.genre = 'sci-fi'
    if (lowerUser.includes('modern') || lowerUser.includes('contemporary')) newPreferences.genre = 'modern'
    if (lowerUser.includes('historical')) newPreferences.genre = 'historical'
    
    // Tone detection
    if (lowerUser.includes('romantic') || lowerUser.includes('soft')) newPreferences.tone = 'romantic'
    if (lowerUser.includes('rough') || lowerUser.includes('dominant')) newPreferences.tone = 'dominant'
    if (lowerUser.includes('playful') || lowerUser.includes('fun')) newPreferences.tone = 'playful'
    if (lowerUser.includes('dark') || lowerUser.includes('intense')) newPreferences.tone = 'dark'
    
    setCreationState(prev => ({ ...prev, preferences: newPreferences }))
  }

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return
    
    const userMessage = currentInput.trim()
    setCurrentInput('')
    addMessage('user', userMessage)
    
    // Check if user wants to generate content
    if (userMessage.toLowerCase().includes('generate') || userMessage.toLowerCase().includes('create') || userMessage.toLowerCase().includes('make it')) {
      await generateFinalContent()
    } else {
      await generateAIResponse(userMessage)
    }
  }

  const generateFinalContent = async () => {
    setIsTyping(true)
    
    try {
      // Build comprehensive prompt from conversation
      const conversationSummary = messages.map(m => m.content).join('\n')
      
      const prompt = `Based on this flirty conversation with a user about creating a NSFW ${type}, generate the final detailed content:
        
        Conversation summary: ${conversationSummary}
        
        Preferences gathered: ${JSON.stringify(creationState.preferences)}
        
        Create a comprehensive NSFW ${type} that matches exactly what the user described in the conversation. Include:
        
        ${type === 'character' ? `
        - Full name and demographics
        - Detailed personality including sexual preferences
        - Background and sexual/romantic history
        - Physical description with intimate details
        - Kinks, turn-ons, and boundaries
        - Motivations and desires
        - Special skills or talents
        ` : `
        - Setting and atmosphere
        - Key characters and their roles
        - Central plot/situation
        - Sexual themes and encounters
        - Possible developments and outcomes
        - Interactive elements if mentioned
        `}
        
        Make it detailed, engaging, and ready to use. Format with clear sections and include content warnings.`
      
      const aiService = await getAIService()
      const generatedContent = await aiService.generateText(prompt, {
        systemPrompt: "You are an expert at creating high-quality adult content. Your responses should be detailed, creative, and professionally written while being explicit when appropriate.",
        temperature: 0.8,
        maxTokens: 2000
      })
      
      setCreationState(prev => ({ 
        ...prev, 
        stage: 'completed',
        generatedContent
      }))
      
      addMessage('ai', `Perfect! I've created your ${type} based on everything we discussed. Here it is, hot and ready for you! 🔥✨\n\nWould you like me to export it for you, or shall we make any adjustments? 💋`)
      
      toast.success(`Your custom ${type} has been generated!`)
      
    } catch (error) {
      addMessage('ai', "Oh no! Something went wrong while creating your content. Let's try again, sweetie! 💕")
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
            <h1 className="text-3xl font-bold">Chat Mode: {type.charAt(0).toUpperCase() + type.slice(1)}</h1>
            <p className="text-muted-foreground">Chat with Luna to build your perfect {type}</p>
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
                    <CardDescription>Your flirty AI creative assistant</CardDescription>
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
                        placeholder="Tell Luna what you're looking for..."
                        className="flex-1"
                        disabled={isTyping}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!currentInput.trim() || isTyping}
                        size="sm"
                      >
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
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Creation Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className={`flex items-center gap-2 ${creationState.stage === 'greeting' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${creationState.stage === 'greeting' ? 'bg-primary' : 'bg-muted'}`}></div>
                    <span className="text-sm">Getting started</span>
                  </div>
                  <div className={`flex items-center gap-2 ${creationState.stage === 'discovery' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${creationState.stage === 'discovery' ? 'bg-primary' : 'bg-muted'}`}></div>
                    <span className="text-sm">Discovering preferences</span>
                  </div>
                  <div className={`flex items-center gap-2 ${creationState.stage === 'finalizing' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${creationState.stage === 'finalizing' ? 'bg-primary' : 'bg-muted'}`}></div>
                    <span className="text-sm">Finalizing details</span>
                  </div>
                  <div className={`flex items-center gap-2 ${creationState.stage === 'completed' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${creationState.stage === 'completed' ? 'bg-primary' : 'bg-muted'}`}></div>
                    <span className="text-sm">Content generated</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gathered Preferences */}
            {Object.keys(creationState.preferences).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(creationState.preferences).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{key}:</span>
                          <span className="font-medium">{Array.isArray(value) ? value.join(', ') : value}</span>
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
                  <CardTitle className="text-lg">Your {type.charAt(0).toUpperCase() + type.slice(1)}</CardTitle>
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
        type={type}
        title={creationState.name || `Custom ${type}`}
      />
    </div>
  )
}