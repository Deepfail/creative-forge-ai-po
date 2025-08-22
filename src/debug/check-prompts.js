// Debug script to check current prompts state
const { useKV } = require('@github/spark/hooks')

async function checkPrompts() {
  try {
    const [prompts] = useKV('chat-prompts', {})
    console.log('Current prompts in storage:', Object.keys(prompts || {}))
    
    if (prompts && prompts['luna-chat-builder']) {
      console.log('Luna/Ali prompt exists:')
      console.log('Name:', prompts['luna-chat-builder'].name)
      console.log('Description:', prompts['luna-chat-builder'].description)
      console.log('System prompt preview:', prompts['luna-chat-builder'].systemPrompt.substring(0, 200) + '...')
    } else {
      console.log('Luna/Ali prompt not found in storage')
    }
  } catch (error) {
    console.error('Error checking prompts:', error)
  }
}

checkPrompts()