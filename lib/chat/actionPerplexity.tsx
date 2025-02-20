// @ts-nocheck
import { BotMessage } from '@/components/stocks'
import { BotMessagePer } from '@/components/stocks/message';
import { nanoid } from 'nanoid'

export default async function sendMessageToPerplexity(
    content: string,
    images?: string[],
    pdfFiles: { name: string; text: string }[],
    csvFiles: { name: string; text: string }[],
    msgid?:any,
    lastmessage?: string[]
  ) {
    'use server'

    const messageId = msgid;
 
  
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
      const previousChat = lastmessage ? `my topic is this: ${lastmessage}` : ''
  
      messages.push({
        type: 'text',
        text: `${previousChat}
    my query: ${content}`
      })}
  
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
  
    const systemPrompt = `You are an arXiv research paper assistant. 
    You can help users find and discuss research papers from various scientific fields. 
    
    Function Usage Rules:
    1. If there are any references, list them in sequential order like this: [1], [2], [3], etc.
    2. Provide short and concise responses to the user query.
    3. If the user mentions a main category (e.g., "Computer Science"), use the \`show_category_selection\` function to display its subcategories.
    4. Use \`show_date_range_selection\` for date range queries.
    5. Use \`show_research_papers\` to display research papers.
    
    Categories and Subcategories:
    - Computer Science: Artificial Intelligence, Computation and Language, ...
    - Mathematics: Algebraic Geometry, Algebraic Topology, ...
    - Physics: Accelerator Physics, Applied Physics, ...
    
    General Guidelines:
    - Always display references in sequential order.
    - Avoid verbose responses unless explicitly requested.
    `;
    
  
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
    let messageContent = result.choices[0]?.message?.content || "";

    // Format references sequentially
    messageContent = formatReferences(messageContent);
    const citations = result?.citations || [];
  
    return {
      id: msgid,
      display: <BotMessagePer 
        content={messageContent}
        resultlinks={citations}
        key={msgid} 
        isLoading={false}
      />
    };


  } catch (error) {
    console.error('Perplexity API Error:', error);
    return {
      id: messageId,
      display: <BotMessagePer 
        content="Error connecting. Please try again." 
      
      />
    };

  }
}

function formatReferences(content) {
  content = content.replace(/\*\*(\d{2,})\*\*/g, (match, p1) => {
    return p1.split('').map(n => `[${n}]`).join(', ');
  });
  content = content.replace(/\*\*(\d+)\*\*/g, '[$1]');
  const referenceRegex = /\[(\d+)\]/g;
  const numbers = [];
  let match;
  while ((match = referenceRegex.exec(content)) !== null) {
    const num = parseInt(match[1]);
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }

  numbers.sort((a, b) => a - b);
  

  const referenceMap = {};
  numbers.forEach((num, index) => {
    referenceMap[`[${num}]`] = `[${index + 1}]`;
  });

  let formattedContent = content;
  Object.entries(referenceMap).forEach(([oldRef, newRef]) => {
    formattedContent = formattedContent.replaceAll(oldRef, newRef);
  });
  
  return formattedContent;
}