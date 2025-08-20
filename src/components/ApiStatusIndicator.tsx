import React from 'react'
import { Badge } from '@/components/ui/badge'
import { useKV } from '@github/spark/hooks'
import { ApiConfig } from './ApiSettings'
import { Key } from '@phosphor-icons/react'

export default function ApiStatusIndicator() {
  const [apiConfig] = useKV<ApiConfig>('api-config', {
    apiKey: '',
    textModel: 'default',
    imageModel: 'flux-1.1-pro'
  })

  const getStatusInfo = () => {
    if (apiConfig?.apiKey) {
      return {
        icon: Key,
        label: 'Venice AI Connected',
        variant: 'secondary' as const,
        color: 'text-secondary'
      }
    } else {
      return {
        icon: Key,
        label: 'Venice AI (No Key)',
        variant: 'destructive' as const,
        color: 'text-destructive'
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