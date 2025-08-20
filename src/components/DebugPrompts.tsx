import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePrompts, defaultPrompts } from '@/l

  const [rawPrompts, setRawPrompts] = useKV('chat-prompts'


    console.log('DebugPrompts - Sorted:'

    setRawPrompts({})

  const resetToDefa
    toast.success('Reset to defaults')

    setPrompts(defaultPrompts)
  }

  const clearStorage = () => {
    setRawPrompts({})
    toast.success('Storage cleared')
  }

  const resetToDefaults = () => {
    setRawPrompts(defaultPrompts)
    toast.success('Reset to defaults')
  }

  const testDirectSet = () => {
    setPrompts(defaultPrompts)
    toast.success('Direct set called')
  }

  return (
    <div className="space-y-4">






























