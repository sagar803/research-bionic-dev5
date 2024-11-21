// @ts-nocheck
import { BotMessage } from '@/components/stocks'
import { BotMessagePer } from '@/components/stocks/message';
import { nanoid } from 'nanoid'

export default async function sendMessageToPerplexity(
    content: string,
    images?: string[],
    pdfFiles: { name: string; text: string }[],
    csvFiles: { name: string; text: string }[]
  ) {
    'use server'
  
    const messages = [];

    // Image processing code remains the same
    if (images?.length > 0) {
      for (const imageData of images) {
        try {
          let mediaType = 'image/jpeg';
          const match = imageData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
          
          if (match) {
            const detectedType = match[1].toLowerCase();
            if (['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(detectedType)) {
              mediaType = detectedType;
            }
          }
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

    // Regular content handling remains the same
    if (content) {
      messages.push({
        type: "text",
        text: content
      });
    }
  
    // PDF and CSV handling remains the same
    if (pdfFiles.length > 0) {
      const pdfContent = pdfFiles.map(pdf => 
        `Document: ${pdf.name}\n${pdf.text}\n---`
      ).join('\n\n');
      
      messages.push({
        type: "text",
        text: `PDF Contents:\n${pdfContent}`
      });
    }
  
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
        Function Usage Rules:
        Provide me short and concise response
    If the user mentions a main category (e.g., "Computer Science"), use the \`show_category_selection\` function to display its subcategories.
    To do this:
    1. Identify the main category mentioned by the user.
    2. Look up the subcategories for that main category in the list below.
    3. Call show_category_selection with these subcategories, using the main category as the title.

    Categories and Subcategories:
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

    Additional Functions:
    - Use \`show_date_range_selection\` for date range queries
    - Use \`show_research_papers\` to display research papers
    
    You can also provide general information about scientific research and arXiv.`
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
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
     const resultlinks = result?.citations 
    return {
      id: nanoid(),
      display: <BotMessagePer content={messageContent} resultlinks={resultlinks}/>
    }

  } catch (error) {
    console.error('Perplexity API Error:', error);
    return {
      id: nanoid(),
      display: <BotMessage content="I apologize, but I'm having trouble connecting right now. Please try again." />
    }
  }
}