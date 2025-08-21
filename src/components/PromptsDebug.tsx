import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePrompts, defaultPrompts } from '@/l
import { usePrompts, defaultPrompts } from '@/lib/prompts'

    console.log('Current prompts:', prom
    console.log('Number of prompts:', Object.keys(prompts || {}).length)


    console.log('Force loading default prompt
    console.log('Default prompts loaded')


    <div className="min-h-screen bg-background p-8">
        <CardHeader>
   

              Log Debug Info
            <Button onClick={forceLoadDefaults} siz
            </Button>

   

                  <div className="font-medium text-sm">{key}</div>

          
              {sortedPrompts.length === 0 && (
                  No prompts found. Try cl
              )}
          </div>
      </Card>
  )









          <div>
            <h3 className="text-lg font-semibold mb-4">Available Prompts ({sortedPrompts.length})</h3>
            <div className="space-y-2">
              {sortedPrompts.map(([key, prompt]) => (
                <div key={key} className="p-3 bg-muted rounded-md">
                  <div className="font-medium text-sm">{key}</div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {typeof prompt === 'string' ? prompt.substring(0, 100) + '...' : JSON.stringify(prompt).substring(0, 100) + '...'}
                  </div>
                </div>
              ))}
              {sortedPrompts.length === 0 && (
                <div className="text-muted-foreground text-center py-8">
                  No prompts found. Try clicking "Force Load Defaults" above.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}