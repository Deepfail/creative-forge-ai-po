import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

  const { prompts, resetToDefaults } = usePrompts()

export default function PromptsDebug() {
  const [prompts, loadPrompts, savePrompt, deletePrompt, forceLoadDefaults] = usePrompts()
  
  const sortedPrompts = Object.entries(prompts || {}).sort(([a], [b]) => a.localeCompare(b))
  
    console.log('Default prompts
    console.log('=== PROMPTS DEBUG INFO ===')

    console.log('Number of prompts:', Object.keys(prompts || {}).length)
    console.log('Default prompts available:', Object.keys(defaultPrompts).length)
    console.log('Default prompts:', defaultPrompts)

  }

  const handleForceDefaults = () => {
          <div>
            <div classN
                <div key={key} className=
   

          
                <div className="text-muted-foregroun
                </div>
            </div>
        </CardContent>
    </div>
}






























