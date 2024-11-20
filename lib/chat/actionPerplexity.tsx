// @ts-nocheck
import { BotMessage } from '@/components/stocks'
import { nanoid } from 'nanoid'

export default async function usePerplexityApi(content: string) {
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
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: content
          }
        ],
        stream: false,
        max_tokens: 4096,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.error('API Error:', response.status);
      throw new Error('Failed to get response');
    }

    const result = await response.json();
    const messageContent = result.choices[0].message.content;

    return {
      id: nanoid(),
      display: <BotMessage content={messageContent} />
    }

  } catch (error) {
    console.error('Perplexity API Error:', error);
    return {
      id: nanoid(),
      display: <BotMessage content="I apologize, but I'm having trouble connecting right now. Please try again." />
    }
  }
}