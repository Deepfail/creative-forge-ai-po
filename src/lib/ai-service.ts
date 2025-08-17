import { ApiConfig } from '@/components/ApiSettings'

export class AIService {
  private static instance: AIService
  private config: ApiConfig | null = null

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  setConfig(config: ApiConfig) {
    this.config = config
  }

  async generateText(prompt: string, options?: {
    systemPrompt?: string
    temperature?: number
    maxTokens?: number
  }): Promise<string> {
    if (!this.config) {
      // Fallback to internal spark.llm
      const fullPrompt = options?.systemPrompt 
        ? spark.llmPrompt`${options.systemPrompt}\n\nUser: ${prompt}`
        : spark.llmPrompt`${prompt}`
      return await spark.llm(fullPrompt)
    }

    if (this.config.provider === 'internal') {
      const fullPrompt = options?.systemPrompt 
        ? spark.llmPrompt`${options.systemPrompt}\n\nUser: ${prompt}`
        : spark.llmPrompt`${prompt}`
      return await spark.llm(fullPrompt, this.config.model)
    }

    // External API call
    const messages = []
    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt })
    }
    messages.push({ role: 'user', content: prompt })

    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        ...(this.config.provider === 'openrouter' && {
          'HTTP-Referer': window.location.origin,
          'X-Title': 'NSFW AI Generator'
        })
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: options?.temperature ?? 0.8,
        max_tokens: options?.maxTokens ?? 2000
      })
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'No response generated'
  }

  async generateImage(prompt: string, options?: {
    width?: number
    height?: number
    style?: string
  }): Promise<string> {
    // Use Venice AI for image generation with auto model
    if (!this.config || this.config.provider !== 'venice') {
      throw new Error('Venice AI is required for image generation')
    }

    const imagePrompt = `Generate a high-quality, detailed image: ${prompt}. Style: ${options?.style || 'realistic digital art, detailed, high resolution'}`

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-2.5-vl', // Use vision model for image generation
          messages: [
            {
              role: 'user',
              content: `Create an image based on this description: ${imagePrompt}. Return the image as a data URL.`
            }
          ],
          temperature: 0.8,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        throw new Error(`Image generation failed: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content || ''
      
      // For now, return a placeholder since Venice doesn't actually generate images
      // In a real implementation, you'd use DALL-E, Midjourney, or another image service
      return this.generatePlaceholderImage(prompt, options?.width || 400, options?.height || 400)
    } catch (error) {
      console.warn('Image generation failed, using placeholder:', error)
      return this.generatePlaceholderImage(prompt, options?.width || 400, options?.height || 400)
    }
  }

  private generatePlaceholderImage(prompt: string, width: number, height: number): string {
    // Generate a portrait-style placeholder based on the character description
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    
    // Parse prompt for character features to determine colors
    const lowerPrompt = prompt.toLowerCase()
    
    // Determine hair color
    let hairColor = '#8B4513' // Default brown
    if (lowerPrompt.includes('blonde') || lowerPrompt.includes('golden')) hairColor = '#FFD700'
    else if (lowerPrompt.includes('black') || lowerPrompt.includes('dark')) hairColor = '#2F2F2F'
    else if (lowerPrompt.includes('red') || lowerPrompt.includes('ginger')) hairColor = '#B22222'
    else if (lowerPrompt.includes('silver') || lowerPrompt.includes('white')) hairColor = '#C0C0C0'
    else if (lowerPrompt.includes('pink')) hairColor = '#FF69B4'
    else if (lowerPrompt.includes('blue')) hairColor = '#4169E1'
    else if (lowerPrompt.includes('green')) hairColor = '#228B22'
    else if (lowerPrompt.includes('purple')) hairColor = '#8A2BE2'
    
    // Determine skin tone
    let skinColor = '#FDBCB4' // Default light
    if (lowerPrompt.includes('tan') || lowerPrompt.includes('olive')) skinColor = '#DEB887'
    else if (lowerPrompt.includes('dark') || lowerPrompt.includes('black')) skinColor = '#8D5524'
    else if (lowerPrompt.includes('pale') || lowerPrompt.includes('fair')) skinColor = '#FFDBAC'
    
    // Determine outfit color
    let outfitColor = '#FF1493' // Default pink
    if (lowerPrompt.includes('cheerleader')) outfitColor = '#FF4500'
    else if (lowerPrompt.includes('emo') || lowerPrompt.includes('goth')) outfitColor = '#2F2F2F'
    else if (lowerPrompt.includes('schoolgirl') || lowerPrompt.includes('uniform')) outfitColor = '#000080'
    else if (lowerPrompt.includes('casual')) outfitColor = '#87CEEB'
    
    // Create background gradient
    const bgGradient = ctx.createRadialGradient(width/2, height/3, 0, width/2, height/3, width/2)
    bgGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
    bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)
    
    // Draw simple portrait silhouette
    const centerX = width / 2
    const centerY = height * 0.6
    
    // Body/shoulders
    ctx.fillStyle = outfitColor
    ctx.beginPath()
    ctx.ellipse(centerX, centerY + height * 0.25, width * 0.4, height * 0.2, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Neck
    ctx.fillStyle = skinColor
    ctx.fillRect(centerX - width * 0.05, centerY, width * 0.1, height * 0.15)
    
    // Head
    ctx.beginPath()
    ctx.ellipse(centerX, centerY - height * 0.1, width * 0.18, height * 0.22, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Hair
    ctx.fillStyle = hairColor
    ctx.beginPath()
    ctx.ellipse(centerX, centerY - height * 0.2, width * 0.22, height * 0.2, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Add some hair texture
    ctx.fillStyle = hairColor + '80' // Semi-transparent
    for (let i = 0; i < 15; i++) {
      const x = centerX + (Math.random() - 0.5) * width * 0.4
      const y = centerY - height * 0.3 + Math.random() * height * 0.25
      const size = Math.random() * 8 + 2
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // Eyes
    ctx.fillStyle = '#2F2F2F'
    ctx.beginPath()
    ctx.arc(centerX - width * 0.07, centerY - height * 0.12, width * 0.02, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(centerX + width * 0.07, centerY - height * 0.12, width * 0.02, 0, Math.PI * 2)
    ctx.fill()
    
    // Eye highlights
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(centerX - width * 0.065, centerY - height * 0.125, width * 0.008, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(centerX + width * 0.075, centerY - height * 0.125, width * 0.008, 0, Math.PI * 2)
    ctx.fill()
    
    // Mouth
    ctx.strokeStyle = '#FF69B4'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(centerX, centerY - height * 0.05, width * 0.03, 0, Math.PI)
    ctx.stroke()
    
    return canvas.toDataURL()
  }
}

export const aiService = AIService.getInstance()