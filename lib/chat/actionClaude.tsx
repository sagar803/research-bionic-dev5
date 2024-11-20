// @ts-nocheck
import { BotMessage } from '@/components/stocks'
import { nanoid } from 'nanoid'

export default async function useClaudeApi(content: string) {

  'use server'
  
  const systemPrompt = `You are an arXiv research paper assistant. You can help users find and discuss research papers from various scientific fields.
    You can ask follow-up questions to clarify the user's request and provide more accurate results.

    If the user mentions a main category (e.g., "Computer Science"), you MUST use the \`show_category_selection\` function to display its subcategories.
    To do this, follow these steps:
    1. Identify the main category mentioned by the user.
    2. Look up the subcategories for that main category in the list below.
    3. Call show_category_selection with these subcategories, using the main category as the title.

    Here are the main categories and their subcategories:

    Computer Science:
    - Artificial Intelligence
    - Computation and Language
    ...

    Mathematics:
    - Algebraic Geometry
    - Algebraic Topology
    ...

    Physics:
    - Accelerator Physics
    - Applied Physics
    ...

    If you need to ask about a date range, use the \`show_date_range_selection\` function.
    If you want to display research papers, use the \`show_research_papers\` function.

    Besides that, you can also chat with users and provide information about scientific research and arXiv.`
  
  try {

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY ,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        messages: [
        {
            role:"assistant",
            content:systemPrompt
        },
          {
            role: 'user',
            content: content
          }
        ],
        max_tokens: 4096,
        temperature: 0.7,
      })
    })

    if (!response.ok) {
        throw new Error(`Failed to get response: ${response.status} ${response.statusText}`);
      }

    const result = await response.json()
    return {
      id: nanoid(),
      display: <BotMessage content={result.content[0].text} />
    }

  } catch (error) {
    console.error('Error:', error)
    return {
      id: nanoid(),
      display: <BotMessage content="Error: Unable to get response" />
    }
  }
}