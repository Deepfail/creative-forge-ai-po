import { ApiConfig, ApiProvider } from '@/components/ApiSettings'
import { useKV } from '@github/spark/hooks'

export class AIService {
  private config: ApiConfig

  constructor(config: ApiConfig) {
    this.config = config
  }

  async generateText(prompt: string, options?: {
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
  }): Promise<string> {
    const { temperature = 0.8, maxTokens = 2000, systemPrompt } = options || {}

    // Use internal Spark AI by default
    if (this.config.provider === 'internal') {
      const fullPrompt = systemPrompt 
        ? spark.llmPrompt`${systemPrompt}\n\n${prompt}`
        : spark.llmPrompt`${prompt}`
      
      return await spark.llm(fullPrompt, this.config.model || 'gpt-4o')
    }

    // Use external API providers
    return this.callExternalAPI(prompt, { temperature, maxTokens, systemPrompt })
  }

  private async callExternalAPI(prompt: string, options: {
    temperature: number
    maxTokens: number
    systemPrompt?: string
  }): Promise<string> {
    const { temperature, maxTokens, systemPrompt } = options
    
    const messages: Array<{ role: string; content: string }> = []
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    
    messages.push({ role: 'user', content: prompt })

    const requestBody = {
      model: this.config.model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`
    }

    // Add provider-specific headers
    if (this.config.provider === 'openrouter') {
      headers['HTTP-Referer'] = window.location.origin
      headers['X-Title'] = 'AI Adult Creative Generator'
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response format')
      }

      return data.choices[0].message.content || ''
    } catch (error) {
      console.error('External API call failed:', error)
      
      // Fallback to internal AI if external API fails
      console.log('Falling back to internal AI...')
      const fallbackPrompt = systemPrompt 
        ? spark.llmPrompt`${systemPrompt}\n\n${prompt}`
        : spark.llmPrompt`${prompt}`
      
      return await spark.llm(fallbackPrompt, 'gpt-4o')
    }
  }

  async generateImage(description: string): Promise<string> {
    // For now, return a placeholder. In the future, this could integrate with image generation APIs
    const imagePrompt = spark.llmPrompt`Generate a detailed visual description for AI image generation based on this character description: ${description}. Focus on physical appearance, pose, clothing, and setting. Make it suitable for adult content generation.`
    
    return await this.generateText(imagePrompt, {
      systemPrompt: 'You are an expert at creating detailed prompts for AI image generation. Create vivid, detailed descriptions that would work well with Stable Diffusion or similar models. Include specific details about appearance, pose, clothing, lighting, and artistic style.',
      maxTokens: 500
    })
  }
}

// Hook to get the configured AI service
export function useAIService(): AIService {
  const [apiConfig] = useKV<ApiConfig>('api-config', {
    provider: 'internal',
    apiKey: '',
    model: 'gpt-4o'
  })
  
  return new AIService(apiConfig)
}

// Function to get AI service with current config
export async function getAIService(): Promise<AIService> {
  try {
    const config = await spark.kv.get<ApiConfig>('api-config')
    return new AIService(config || {
      provider: 'internal',
      apiKey: '',
      model: 'gpt-4o'
    })
  } catch {
    return new AIService({
      provider: 'internal',
      apiKey: '',
      model: 'gpt-4o'
    })
  }
}