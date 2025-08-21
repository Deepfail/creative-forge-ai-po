import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePrompts, defaultPrompts } from '@/l
import { usePrompts, defaultPrompts } from '@/lib/prompts'

    console.log('Current prompts:', prom
    console.log('Default prompts:', defaultPrompts)


    console.log('Force loading default p
    console.log('Current prompts:', prompts)
    console.log('Sorted prompts:', sortedPrompts)
    console.log('Default prompts:', defaultPrompts)
    console.log('Number of prompts:', Object.keys(prompts || {}).length)
    console.log('===================')
   

        
          <Button onClick={showDebugInfo} size="sm"
          </Button>
   

          

          <div>Ava
        </div>
    </Card>
}







        <div className="space-y-2">
          <Button onClick={showDebugInfo} size="sm">
            Log Debug Info
          </Button>
          <Button onClick={forceLoadDefaults} size="sm" variant="outline">














