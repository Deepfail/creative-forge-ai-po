import { ApiConfig } from '@/components/ApiSettings'

// Semaphore class to limit concurrent requests
class Semaphore {
  private permits: number
  private waiting: Array<() => void> = []

  constructor(permits: number) {
    this.permits = permits
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      this.waiting.push(resolve)
    })
  }

  release(): void {
    this.permits++
    if (this.waiting.length > 0) {
      const next = this.waiting.shift()
      if (next) {
        this.permits--
        next()
      }
    }
  }
}

export class AIService {
  private static instance: AIService
  private config: ApiConfig | null = null
  private semaphore = new Semaphore(2) // Limit to 2 concurrent requests

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  setConfig(config: ApiConfig) {
    this.config = config
    console.log('AI Service config set:', {
      hasApiKey: !!config.apiKey,
      textModel: config.textModel,
      imageModel: config.imageModel
    })
  }

  async generateText(prompt: string, options?: {
    systemPrompt?: string
    temperature?: number
    maxTokens?: number
  }): Promise<string> {
    await this.semaphore.acquire()
    try {
      // Always use Venice AI if configured, fallback to internal
      if (this.config?.apiKey) {
        console.log('Using Venice AI for text generation with model:', this.config.textModel)
        
        const messages: Array<{role: string, content: string}> = []
        if (options?.systemPrompt) {
          messages.push({ role: 'system', content: options.systemPrompt })
        }
        messages.push({ role: 'user', content: prompt })

        const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify({
            model: this.config.textModel,
            messages,
            temperature: options?.temperature ?? 0.8,
            max_tokens: options?.maxTokens ?? 2000
          })
        })

        if (!response.ok) {
          console.error('Venice AI text generation failed, falling back to internal')
          // Fallback to internal
          const fullPrompt = options?.systemPrompt 
            ? (window as any).spark.llmPrompt`${options.systemPrompt}\n\nUser: ${prompt}`
            : (window as any).spark.llmPrompt`${prompt}`
          return await (window as any).spark.llm(fullPrompt)
        }

        const data = await response.json()
        return data.choices[0]?.message?.content || 'No response generated'
      }

      // Fallback to internal spark.llm
      console.log('Using internal AI for text generation')
      const fullPrompt = options?.systemPrompt 
        ? (window as any).spark.llmPrompt`${options.systemPrompt}\n\nUser: ${prompt}`
        : (window as any).spark.llmPrompt`${prompt}`
      return await (window as any).spark.llm(fullPrompt)
    } finally {
      this.semaphore.release()
    }
  }

  async generateImage(prompt: string, options?: {
    width?: number
    height?: number
    style?: string
  }): Promise<string> {
    await this.semaphore.acquire()
    try {
      console.log('Starting Venice AI image generation for prompt:', prompt)
      
      if (!this.config?.apiKey) {
        console.log('No Venice AI API key configured - using placeholder')
        return this.generateAdvancedPlaceholder(prompt, options?.width || 400, options?.height || 400)
      }
      
      // First, enhance the prompt using internal AI
      const promptBuilder = (window as any).spark.llmPrompt`Create a detailed, professional image generation prompt for: "${prompt}". Include specific visual details like lighting, composition, camera angle, and quality descriptors. Focus on realistic portrait photography. Respond with just the prompt, no additional text.`
      
      const enhancedPrompt = await (window as any).spark.llm(promptBuilder)
      console.log('Enhanced prompt from LLM:', enhancedPrompt)
      
      const finalPrompt = `${enhancedPrompt.trim()}, ${options?.style || 'photorealistic, high quality, detailed, professional portrait photography'}`
      console.log('Final prompt for Venice AI:', finalPrompt)
      console.log('Using Venice AI image model:', this.config.imageModel)
      
      // Updated models list with correct Venice AI models
      const modelsToTry = [
        this.config.imageModel,
        'venice-sd35',  // Default
        'flux-dev',     // High quality
        'flux-dev-uncensored', // Uncensored
        'hidream',      // Alternative
        'pony-realism', // Most uncensored
        'wai-Illustrious' // Anime/NSFW capable
      ].filter((model, index, arr) => arr.indexOf(model) === index) // Remove duplicates
      
      let lastError: any = null
      
      for (const model of modelsToTry) {
        try {
          console.log(`Trying Venice AI image model: ${model}`)
          
          const requestBody = {
            model: model,
            prompt: finalPrompt,
            hide_watermark: true
          }
          
          console.log('Sending request to Venice AI image/generate:', requestBody)
          
          const response = await fetch('https://api.venice.ai/api/v1/image/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify(requestBody)
          })

          console.log(`Venice AI Response status for model ${model}: ${response.status}`)
          
          if (response.ok) {
            const data = await response.json()
            console.log('Venice AI Response data structure:', Object.keys(data))
            console.log('Venice AI Response data:', data)
            
            // Handle different possible response formats from Venice AI
            // Try the most common fields Venice might return
            if (data.images && Array.isArray(data.images) && data.images.length > 0) {
              const imageData = data.images[0]
              console.log('Found images array, first image type:', typeof imageData)
              
              if (typeof imageData === 'string') {
                // Venice returns base64 encoded images
                const imageUrl = imageData.startsWith('data:') ? imageData : `data:image/png;base64,${imageData}`
                console.log(`Successfully generated image via Venice AI with model ${model} (images array)`)
                return imageUrl
              }
            }
            
            // Check for single image field
            if (data.image && typeof data.image === 'string') {
              console.log('Found image field')
              const finalImage = data.image.startsWith('data:') ? data.image : `data:image/png;base64,${data.image}`
              console.log(`Successfully generated image via Venice AI with model ${model} (image field)`)
              return finalImage
            }
            
            // Check for generated_images field
            if (data.generated_images && Array.isArray(data.generated_images) && data.generated_images.length > 0) {
              const imageData = data.generated_images[0]
              console.log('Found generated_images array')
              
              if (typeof imageData === 'string') {
                const imageUrl = imageData.startsWith('data:') ? imageData : `data:image/png;base64,${imageData}`
                console.log(`Successfully generated image via Venice AI with model ${model} (generated_images)`)
                return imageUrl
              }
            }
            
            // Check for data field (raw base64)
            if (data.data && typeof data.data === 'string') {
              console.log('Found data field, converting to data URL')
              return `data:image/png;base64,${data.data}`
            }
            
            // Check for url field
            if (data.url && typeof data.url === 'string') {
              console.log('Found url field:', data.url)
              return data.url
            }
            
            console.log(`No recognized image data in response for model ${model}, available fields:`, Object.keys(data))
            lastError = new Error(`No valid image data found in Venice AI response for model ${model}`)
            continue // Try next model
            
          } else {
            const errorText = await response.text()
            console.error(`Venice AI HTTP ${response.status} for model ${model}:`, errorText)
            lastError = new Error(`Venice AI API error for model ${model}: ${response.status} - ${errorText}`)
            
            // If it's a model not found error, try the next model
            if (response.status === 404 || errorText.includes('model not found') || errorText.includes('Specified model not found')) {
              console.log(`Model ${model} not found, trying next fallback...`)
              continue
            }
            
            // For other errors, throw immediately
            throw lastError
          }
        } catch (modelError) {
          console.error(`Error with model ${model}:`, modelError)
          lastError = modelError
          continue // Try next model
        }
      }
      
      // If all models failed, throw the last error
      throw lastError || new Error('All Venice AI image models failed')
      
    } catch (error) {
      console.error('Venice AI image generation failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.log('Creating enhanced placeholder due to error:', errorMessage)
      return this.generateAdvancedPlaceholder(prompt, options?.width || 400, options?.height || 400)
    } finally {
      this.semaphore.release()
    }
  }

  private generateAdvancedPlaceholder(prompt: string, width: number, height: number): string {
    // Generate a very sophisticated SVG-based portrait that looks more like an illustration
    const lowerPrompt = prompt.toLowerCase()
    console.log('Generating SVG placeholder for prompt:', lowerPrompt)
    
    // Determine character features
    let hairColor = '#4A4A4A' // Default dark brown
    let skinColor = '#F5DEB3' // Default natural skin tone 
    let outfitColor = '#6B46C1' // Default purple instead of hot pink
    let eyeColor = '#8B4513' // Default brown eyes
    
    if (lowerPrompt.includes('blonde')) hairColor = '#FFD700'
    else if (lowerPrompt.includes('black hair') || lowerPrompt.includes('dark hair')) hairColor = '#1a1a1a'
    else if (lowerPrompt.includes('red hair') || lowerPrompt.includes('ginger')) hairColor = '#B22222'
    else if (lowerPrompt.includes('brown hair') || lowerPrompt.includes('brunette')) hairColor = '#654321'
    
    if (lowerPrompt.includes('tan skin')) skinColor = '#DEB887'
    else if (lowerPrompt.includes('dark skin')) skinColor = '#8D5524'
    else if (lowerPrompt.includes('pale skin')) skinColor = '#FFDBAC'
    
    if (lowerPrompt.includes('green eyes')) eyeColor = '#228B22'
    else if (lowerPrompt.includes('brown eyes')) eyeColor = '#8B4513'
    else if (lowerPrompt.includes('hazel eyes')) eyeColor = '#A0522D'
    
    // Generate style-based outfit  
    if (lowerPrompt.includes('goth') || lowerPrompt.includes('emo')) outfitColor = '#2F2F2F'
    else if (lowerPrompt.includes('cheerleader')) outfitColor = '#FF4500'
    else if (lowerPrompt.includes('business')) outfitColor = '#4A4A4A'
    
    console.log('SVG colors determined:', { hairColor, skinColor, outfitColor, eyeColor })
    
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bg" cx="50%" cy="30%" r="70%">
            <stop offset="0%" style="stop-color:rgba(200,200,200,0.1);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(100,100,100,0.3);stop-opacity:1" />
          </radialGradient>
          <linearGradient id="hair" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${hairColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${this.adjustBrightness(hairColor, -20)};stop-opacity:1" />
          </linearGradient>
          <linearGradient id="skin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${this.adjustBrightness(skinColor, 10)};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${skinColor};stop-opacity:1" />
          </linearGradient>
          <linearGradient id="outfit" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${this.adjustBrightness(outfitColor, 15)};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${outfitColor};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#bg)"/>
        
        <!-- Body/Shoulders -->
        <ellipse cx="${width/2}" cy="${height*0.85}" rx="${width*0.4}" ry="${height*0.2}" fill="url(#outfit)"/>
        
        <!-- Neck -->
        <rect x="${width/2 - width*0.05}" y="${height*0.6}" width="${width*0.1}" height="${height*0.15}" fill="url(#skin)"/>
        
        <!-- Head -->
        <ellipse cx="${width/2}" cy="${height*0.5}" rx="${width*0.18}" ry="${height*0.22}" fill="url(#skin)"/>
        
        <!-- Hair -->
        <ellipse cx="${width/2}" cy="${height*0.35}" rx="${width*0.22}" ry="${height*0.25}" fill="url(#hair)"/>
        
        <!-- Eyes -->
        <ellipse cx="${width/2 - width*0.07}" cy="${height*0.46}" rx="${width*0.02}" ry="${width*0.025}" fill="white"/>
        <ellipse cx="${width/2 + width*0.07}" cy="${height*0.46}" rx="${width*0.02}" ry="${width*0.025}" fill="white"/>
        <circle cx="${width/2 - width*0.07}" cy="${height*0.46}" r="${width*0.015}" fill="${eyeColor}"/>
        <circle cx="${width/2 + width*0.07}" cy="${height*0.46}" r="${width*0.015}" fill="${eyeColor}"/>
        <circle cx="${width/2 - width*0.065}" cy="${height*0.455}" r="${width*0.005}" fill="white"/>
        <circle cx="${width/2 + width*0.075}" cy="${height*0.455}" r="${width*0.005}" fill="white"/>
        
        <!-- Eyebrows -->
        <ellipse cx="${width/2 - width*0.07}" cy="${height*0.43}" rx="${width*0.025}" ry="${width*0.008}" fill="${this.adjustBrightness(hairColor, -30)}"/>
        <ellipse cx="${width/2 + width*0.07}" cy="${height*0.43}" rx="${width*0.025}" ry="${width*0.008}" fill="${this.adjustBrightness(hairColor, -30)}"/>
        
        <!-- Nose -->
        <ellipse cx="${width/2}" cy="${height*0.52}" rx="${width*0.008}" ry="${width*0.02}" fill="${this.adjustBrightness(skinColor, -10)}" opacity="0.6"/>
        
        <!-- Lips -->
        <ellipse cx="${width/2}" cy="${height*0.57}" rx="${width*0.025}" ry="${width*0.012}" fill="#FF69B4"/>
        
        <!-- Hair highlights -->
        <ellipse cx="${width/2 - width*0.1}" cy="${height*0.32}" rx="${width*0.03}" ry="${width*0.08}" fill="${this.adjustBrightness(hairColor, 30)}" opacity="0.4"/>
        <ellipse cx="${width/2 + width*0.08}" cy="${height*0.35}" rx="${width*0.025}" ry="${width*0.06}" fill="${this.adjustBrightness(hairColor, 30)}" opacity="0.4"/>
        
        <!-- Text overlay -->
        <text x="${width/2}" y="${height - 20}" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Venice AI Unavailable - SVG Placeholder</text>
      </svg>
    `
    
    console.log('Generated SVG placeholder with outfit color:', outfitColor)
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }
  
  private adjustBrightness(hex: string, percent: number): string {
    // Convert hex to RGB
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
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