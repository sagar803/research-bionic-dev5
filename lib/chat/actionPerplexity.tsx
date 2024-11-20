// @ts-nocheck
import { BotMessage } from '@/components/stocks'
import { nanoid } from 'nanoid'

export default async function sendMessageToPerplexity(
    content: string,
    images?: string[],
    pdfFiles: { name: string; text: string }[],
    csvFiles: { name: string; text: string }[]
  ) {
    'use server'
  
    const messages = [];

    if (images?.length > 0) {
      for (const imageData of images) {
        try {
          let mediaType = 'image/jpeg'; // default
          const match = imageData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
          
          if (match) {
            const detectedType = match[1].toLowerCase();
            // Only allow supported formats
            if (['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(detectedType)) {
              mediaType = detectedType;
            }
          }
          // Remove the "data:image/jpeg;base64," prefix if present
          const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, "");
          
          messages.push({
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Data
            }
          });
        } catch (error) {
          console.error(`Error processing image:`, error);
          messages.push({
            type: "text",
            text: `Failed to process an image`
          });
        }
      }
    }
  
    // Add main text content
    if (content) {
      messages.push({
        type: "text",
        text: content
      });
    }
  
    // Add PDF content if present
    if (pdfFiles.length > 0) {
      const pdfContent = pdfFiles.map(pdf => 
        `Document: ${pdf.name}\n${pdf.text}\n---`
      ).join('\n\n');
      
      messages.push({
        type: "text",
        text: `PDF Contents:\n${pdfContent}`
      });
    }
  
    // Add CSV content if present
    if (csvFiles.length > 0) {
      const csvContent = csvFiles.map(csv => 
        `File: ${csv.name}\n${csv.text}\n---`
      ).join('\n\n');
      
      messages.push({
        type: "text",
        text: `CSV Data:\n${csvContent}`
      });
    }
  
    
  
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
            content: messages
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