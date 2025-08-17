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
    if (!this.config || !this.config.apiKey) {
      console.log('No API config found, using placeholder for:', prompt)
      return this.generatePlaceholderImage(prompt, options?.width || 400, options?.height || 400)
    }

    if (this.config.provider === 'venice') {
      try {
        // Venice AI image generation endpoint
        const imagePrompt = `${prompt}. ${options?.style || 'realistic portrait, detailed, high quality'}`
        
        const response = await fetch('https://api.venice.ai/api/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify({
            prompt: imagePrompt,
            model: 'default', // Venice auto model for images
            width: options?.width || 512,
            height: options?.height || 512,
            n: 1
          })
        })

        if (!response.ok) {
          throw new Error(`Venice AI image generation failed: ${response.statusText}`)
        }

        const data = await response.json()
        if (data.data && data.data[0] && data.data[0].url) {
          return data.data[0].url
        } else {
          throw new Error('Invalid response format from Venice AI')
        }
      } catch (error) {
        console.warn('Venice AI image generation failed, using placeholder:', error)
        return this.generatePlaceholderImage(prompt, options?.width || 400, options?.height || 400)
      }
    }

    // For other providers, use placeholder for now
    console.log('Image generation not supported for provider:', this.config.provider)
    return this.generatePlaceholderImage(prompt, options?.width || 400, options?.height || 400)
  }

  private generatePlaceholderImage(prompt: string, width: number, height: number): string {
    // Generate a more detailed portrait-style placeholder based on the character description
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    
    // Parse prompt for character features to determine colors
    const lowerPrompt = prompt.toLowerCase()
    
    // Determine hair color with more variety
    let hairColor = '#8B4513' // Default brown
    if (lowerPrompt.includes('blonde') || lowerPrompt.includes('golden')) hairColor = '#FFD700'
    else if (lowerPrompt.includes('black') || lowerPrompt.includes('dark hair')) hairColor = '#1a1a1a'
    else if (lowerPrompt.includes('red') || lowerPrompt.includes('ginger') || lowerPrompt.includes('auburn')) hairColor = '#B22222'
    else if (lowerPrompt.includes('silver') || lowerPrompt.includes('white') || lowerPrompt.includes('platinum')) hairColor = '#C0C0C0'
    else if (lowerPrompt.includes('pink')) hairColor = '#FF69B4'
    else if (lowerPrompt.includes('blue')) hairColor = '#4169E1'
    else if (lowerPrompt.includes('green')) hairColor = '#228B22'
    else if (lowerPrompt.includes('purple') || lowerPrompt.includes('violet')) hairColor = '#8A2BE2'
    else if (lowerPrompt.includes('brown') || lowerPrompt.includes('brunette')) hairColor = '#654321'
    else if (lowerPrompt.includes('light brown')) hairColor = '#A0522D'
    
    // Determine skin tone with more variety
    let skinColor = '#FDBCB4' // Default light
    if (lowerPrompt.includes('tan') || lowerPrompt.includes('olive')) skinColor = '#DEB887'
    else if (lowerPrompt.includes('dark skin') || lowerPrompt.includes('black')) skinColor = '#8D5524'
    else if (lowerPrompt.includes('pale') || lowerPrompt.includes('fair')) skinColor = '#FFDBAC'
    else if (lowerPrompt.includes('caramel') || lowerPrompt.includes('honey')) skinColor = '#D2B48C'
    else if (lowerPrompt.includes('ebony')) skinColor = '#704214'
    
    // Determine outfit color based on character type
    let outfitColor = '#FF1493' // Default pink
    if (lowerPrompt.includes('cheerleader')) outfitColor = '#FF4500'
    else if (lowerPrompt.includes('emo') || lowerPrompt.includes('goth')) outfitColor = '#2F2F2F'
    else if (lowerPrompt.includes('schoolgirl') || lowerPrompt.includes('uniform')) outfitColor = '#000080'
    else if (lowerPrompt.includes('casual')) outfitColor = '#87CEEB'
    else if (lowerPrompt.includes('business') || lowerPrompt.includes('professional')) outfitColor = '#4A4A4A'
    else if (lowerPrompt.includes('milf') || lowerPrompt.includes('mature')) outfitColor = '#8B0000'
    else if (lowerPrompt.includes('punk')) outfitColor = '#800080'
    else if (lowerPrompt.includes('nerd') || lowerPrompt.includes('bookworm')) outfitColor = '#228B22'
    
    // Create gradient background based on personality
    const bgGradient = ctx.createRadialGradient(width/2, height/3, 0, width/2, height/3, width/2)
    if (lowerPrompt.includes('shy') || lowerPrompt.includes('innocent')) {
      bgGradient.addColorStop(0, 'rgba(255, 182, 193, 0.2)')
      bgGradient.addColorStop(1, 'rgba(176, 224, 230, 0.3)')
    } else if (lowerPrompt.includes('wild') || lowerPrompt.includes('bold')) {
      bgGradient.addColorStop(0, 'rgba(255, 69, 0, 0.2)')
      bgGradient.addColorStop(1, 'rgba(255, 20, 147, 0.3)')
    } else if (lowerPrompt.includes('goth') || lowerPrompt.includes('emo')) {
      bgGradient.addColorStop(0, 'rgba(75, 0, 130, 0.2)')
      bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)')
    } else {
      bgGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
      bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)')
    }
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)
    
    // Draw improved portrait silhouette
    const centerX = width / 2
    const centerY = height * 0.6
    
    // Body/shoulders with more shape variation
    ctx.fillStyle = outfitColor
    ctx.beginPath()
    if (lowerPrompt.includes('milf') || lowerPrompt.includes('mature')) {
      ctx.ellipse(centerX, centerY + height * 0.25, width * 0.45, height * 0.22, 0, 0, Math.PI * 2)
    } else {
      ctx.ellipse(centerX, centerY + height * 0.25, width * 0.4, height * 0.2, 0, 0, Math.PI * 2)
    }
    ctx.fill()
    
    // Add outfit details
    if (lowerPrompt.includes('cheerleader')) {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(centerX - width * 0.03, centerY + height * 0.15, width * 0.06, height * 0.1)
    } else if (lowerPrompt.includes('business')) {
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(centerX - width * 0.1, centerY + height * 0.1)
      ctx.lineTo(centerX + width * 0.1, centerY + height * 0.1)
      ctx.stroke()
    }
    
    // Neck
    ctx.fillStyle = skinColor
    ctx.fillRect(centerX - width * 0.05, centerY, width * 0.1, height * 0.15)
    
    // Head with more shape variation
    ctx.beginPath()
    if (lowerPrompt.includes('mature') || lowerPrompt.includes('milf')) {
      ctx.ellipse(centerX, centerY - height * 0.1, width * 0.19, height * 0.23, 0, 0, Math.PI * 2)
    } else {
      ctx.ellipse(centerX, centerY - height * 0.1, width * 0.18, height * 0.22, 0, 0, Math.PI * 2)
    }
    ctx.fill()
    
    // Hair with style variations
    ctx.fillStyle = hairColor
    ctx.beginPath()
    if (lowerPrompt.includes('long') || lowerPrompt.includes('flowing')) {
      // Long hair
      ctx.ellipse(centerX, centerY - height * 0.15, width * 0.25, height * 0.25, 0, 0, Math.PI * 2)
    } else if (lowerPrompt.includes('short') || lowerPrompt.includes('pixie')) {
      // Short hair
      ctx.ellipse(centerX, centerY - height * 0.2, width * 0.2, height * 0.18, 0, 0, Math.PI * 2)
    } else if (lowerPrompt.includes('punk') || lowerPrompt.includes('mohawk')) {
      // Punk style
      ctx.rect(centerX - width * 0.05, centerY - height * 0.35, width * 0.1, height * 0.15)
    } else {
      // Medium hair
      ctx.ellipse(centerX, centerY - height * 0.2, width * 0.22, height * 0.2, 0, 0, Math.PI * 2)
    }
    ctx.fill()
    
    // Add hair highlights and texture
    ctx.fillStyle = hairColor + '60' // Semi-transparent
    for (let i = 0; i < 20; i++) {
      const x = centerX + (Math.random() - 0.5) * width * 0.4
      const y = centerY - height * 0.35 + Math.random() * height * 0.3
      const size = Math.random() * 6 + 1
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // Eyes with more expression
    const eyeSize = width * 0.025
    ctx.fillStyle = '#2F2F2F'
    ctx.beginPath()
    ctx.arc(centerX - width * 0.07, centerY - height * 0.12, eyeSize, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(centerX + width * 0.07, centerY - height * 0.12, eyeSize, 0, Math.PI * 2)
    ctx.fill()
    
    // Eye highlights
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(centerX - width * 0.065, centerY - height * 0.125, width * 0.008, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(centerX + width * 0.075, centerY - height * 0.125, width * 0.008, 0, Math.PI * 2)
    ctx.fill()
    
    // Eyebrows
    ctx.strokeStyle = hairColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(centerX - width * 0.09, centerY - height * 0.15)
    ctx.lineTo(centerX - width * 0.05, centerY - height * 0.145)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(centerX + width * 0.05, centerY - height * 0.145)
    ctx.lineTo(centerX + width * 0.09, centerY - height * 0.15)
    ctx.stroke()
    
    // Lips with style variation
    ctx.fillStyle = '#FF69B4'
    if (lowerPrompt.includes('goth') || lowerPrompt.includes('emo')) {
      ctx.fillStyle = '#800080'
    } else if (lowerPrompt.includes('natural') || lowerPrompt.includes('innocent')) {
      ctx.fillStyle = '#FFB6C1'
    }
    ctx.beginPath()
    ctx.ellipse(centerX, centerY - height * 0.05, width * 0.025, width * 0.015, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Add personality-based accessories
    if (lowerPrompt.includes('nerd') || lowerPrompt.includes('bookworm')) {
      // Glasses
      ctx.strokeStyle = '#2F2F2F'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX - width * 0.07, centerY - height * 0.12, width * 0.04, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(centerX + width * 0.07, centerY - height * 0.12, width * 0.04, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(centerX - width * 0.03, centerY - height * 0.12)
      ctx.lineTo(centerX + width * 0.03, centerY - height * 0.12)
      ctx.stroke()
    }
    
    if (lowerPrompt.includes('punk') || lowerPrompt.includes('rebel')) {
      // Earrings
      ctx.fillStyle = '#C0C0C0'
      ctx.beginPath()
      ctx.arc(centerX - width * 0.12, centerY - height * 0.08, width * 0.01, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(centerX + width * 0.12, centerY - height * 0.08, width * 0.01, 0, Math.PI * 2)
      ctx.fill()
    }
    
    return canvas.toDataURL()
  }
}

export const aiService = AIService.getInstance()