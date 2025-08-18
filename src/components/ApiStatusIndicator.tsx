import React from 'react'
import { Badge } from '@/components/ui/badge'
import { useKV } from '@github/spark/hooks'
import { ApiConfig } from './ApiSettings'
import { Key, Globe, Sparkle } from '@phosphor-icons/react'

export default function ApiStatusIndicator() {
  const [apiConfig] = useKV<ApiConfig>('api-config', {
    provider: 'internal',
    apiKey: '',
    model: 'gpt-4o'
  })

  const getStatusInfo = () => {
    switch (apiConfig?.provider) {
      case 'internal':
        return {
          icon: Sparkle,
          label: 'Internal AI',
          variant: 'default' as const,
          color: 'text-primary'
        }
      case 'openrouter':
        return {
          icon: Globe,
          label: apiConfig?.apiKey ? 'OpenRouter' : 'OpenRouter (No Key)',
          variant: apiConfig?.apiKey ? 'secondary' as const : 'destructive' as const,
          color: apiConfig?.apiKey ? 'text-secondary' : 'text-destructive'
        }
      case 'venice':
        return {
          icon: Key,
          label: 'Venice.ai (Built-in)',
          variant: 'secondary' as const,
          color: 'text-secondary'
        }
      default:
        return {
          icon: Sparkle,
          label: 'Internal AI',
          variant: 'default' as const,
          color: 'text-primary'
        }
    }
  }

  const status = getStatusInfo()
  const Icon = status.icon

  return (
    <Badge variant={status.variant} className="flex items-center gap-1">
      <Icon size={12} className={status.color} />
      {status.label}
    </Badge>
  )
}