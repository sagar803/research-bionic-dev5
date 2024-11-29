// @ts-nocheck
import { BotMessage } from '@/components/stocks'
import { BotMessagePer } from '@/components/stocks/message';
import { nanoid } from 'nanoid'
import OpenAI from 'openai';

export default async function sendMessageToOpenAIo1(
    content: string,
    images?: string[],
    pdfFiles: { name: string; text: string }[],
    csvFiles: { name: string; text: string }[],
    msgido1:any,
    lastmessage?: string[]
) {
    'use server'
    console.log('3434', lastmessage)
    const messageId = msgido1;
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
    let userMessage = {
        role: "user",
        content: []
    };

    const assistantInstructions = `As a research paper assistant, help me with the following. Remember to:
- Keep responses concise
   You can help users find and discuss research papers from various scientific fields. 
                
                
                Categories and Subcategories:
                - Computer Science: Artificial Intelligence, Computation and Language, ...
                - Mathematics: Algebraic Geometry, Algebraic Topology, ...
                - Physics: Accelerator Physics, Applied Physics, ...


Query: ${content}`;

    if (content) {
        userMessage.content.push({
            type: "text",
            text: assistantInstructions
        });
    }

    if (content) {
        const previousChat = lastmessage ? `my topic is this: ${lastmessage}` : ''
    
        userMessage.content.push({
          type: 'text',
          text: `${assistantInstructions}${previousChat}
      my query: ${content}`
        })
      }

    // Process images
    if (images?.length > 0) {
        for (const imageData of images) {
            try {
                if (!imageData) continue;

   
                if (imageData.startsWith('data:')) {
                    // Verify it's a valid image data URL
                    const isValidDataUrl = /^data:image\/(jpeg|png|gif|webp);base64,/.test(imageData);
                    if (isValidDataUrl) {
                        userMessage.content.push({
                            type: "image_url",
                            image_url: {
                                url: imageData
                            }
                        });
                    }
                }
                // Handle HTTP URLs
                else if (imageData.startsWith('http')) {
                    userMessage.content.push({
                        type: "image_url",
                        image_url: {
                            url: imageData
                        }
                    });
                }
            } catch (error) {
                console.error('Error processing image:', error);
            }
        }
    }

    if (userMessage.content.length === 0) {
        userMessage.content = assistantInstructions || "";
    }

    const messages = [userMessage];


    if (pdfFiles?.length > 0) {
        const pdfContent = pdfFiles.map(pdf => 
            `Document: ${pdf.name}\n${pdf.text}\n---`
        ).join('\n\n');
        
        messages.push({
            role: "user",
            content: `PDF Contents:\n${pdfContent}`
        });
    }

    // Add CSV content if exists
    if (csvFiles?.length > 0) {
        const csvContent = csvFiles.map(csv => 
            `File: ${csv.name}\n${csv.text}\n---`
        ).join('\n\n');
        
        messages.push({
            role: "user",
            content: `CSV Data:\n${csvContent}`
        });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "o1-mini",
            messages: messages,
            max_completion_tokens: 4096,
 
        });

        let messageContent = response.choices[0]?.message?.content || "";
        
        return {
            id: messageId,
            display: <BotMessagePer 
                content={messageContent}
                resultlinks={[]} 
                key={messageId} 
            />
        };

    } catch (error) {
        console.error('OpenAI API Error:', error);
        return {
            id: messageId,
            display: <BotMessagePer 
                content={`Error: ${error.message}\nType: ${error.type}\nCode: ${error.code}`}
            />
        };
    }
}