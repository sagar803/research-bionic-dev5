// @ts-nocheck
import { BotMessage } from '@/components/stocks'
import { nanoid } from 'nanoid'

export default async function sendMessageToClaude(
  content: string,
  images?: string[],
  pdfFiles: { name: string; text: string }[] = [],
  csvFiles: { name: string; text: string }[] = []
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


  const systemPrompt = `
  You are an research paper assistant. You can help users find and discuss research papers from various scientific fields.
  You can ask follow-up questions to clarify the user's request and provide more accurate results.

  Here are the main categories and their subcategories:
  - Computer Science: Artificial Intelligence, Computation and Language...
  - Mathematics: Algebraic Geometry, Algebraic Topology...
  - Physics: Accelerator Physics, Applied Physics...
  Besides that, you can also chat with users and provide information about scientific research.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        messages: [
          {
            role: 'assistant',
            content: systemPrompt
          },
          {
            role: 'user',
            content: messages 
          }
        ],
        max_tokens: 4096,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to get response: ${response.status} ${response.statusText}`);
    }

    const result = await response.json()
    
    if (!result.content || result.content.length === 0 || typeof result.content[0].text !== 'string') {
      console.error('Invalid response format from Claude API:', result);
      throw new Error('Invalid response format from Claude API');
    }

    return {
      id: nanoid(),
      display: <BotMessage content={result.content[0].text} />
    }

  } catch (error) {
    console.error('Error:', error)
    return {
      id: nanoid(),
      display: <BotMessage content="I apologize, but I'm having trouble processing your request. Please try again or contact support if the issue persists." />
    }
  }
}