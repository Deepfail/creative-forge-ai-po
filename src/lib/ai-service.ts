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
    // Generate a colorful gradient placeholder based on the prompt
    const colors = [
      '#ff6b9d', '#ffa726', '#66bb6a', '#42a5f5', 
      '#ab47bc', '#ef5350', '#26c6da', '#9ccc65'
    ]
    
    const hash = prompt.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    const color1 = colors[Math.abs(hash) % colors.length]
    const color2 = colors[Math.abs(hash + 1) % colors.length]
    
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, color1)
    gradient.addColorStop(1, color2)
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    // Add some texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = Math.random() * 20 + 5
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // Add text overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.font = `${Math.min(width, height) / 15}px Inter, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    const lines = prompt.split(' ').reduce((acc: string[], word, i) => {
      if (i === 0) {
        acc.push(word)
      } else if (acc[acc.length - 1].length + word.length < 15) {
        acc[acc.length - 1] += ' ' + word
      } else {
        acc.push(word)
      }
      return acc
    }, [])
    
    lines.slice(0, 3).forEach((line, i) => {
      ctx.fillText(line, width / 2, height / 2 + (i - 1) * (Math.min(width, height) / 12))
    })
    
    return canvas.toDataURL()
  }
}

export const aiService = AIService.getInstance()