// @ts-nocheck
import { BotMessage } from '@/components/stocks'
import { BotMessagePer } from '@/components/stocks/message';
import { nanoid } from 'nanoid'
import OpenAI from 'openai';

export default async function sendMessageToOpenAI(
    content: string,
    images?: string[],
    pdfFiles: { name: string; text: string }[],
    csvFiles: { name: string; text: string }[],
) {
    'use server'

    const messageId = nanoid();
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    // Initialize message content with text if it exists
    let userMessage = {
        role: "user",
        content: []
    };

    // Add text content if it exists
    if (content) {
        userMessage.content.push({
            type: "text",
            text: content
        });
    }

    // Process images
    if (images?.length > 0) {
        for (const imageData of images) {
            try {
                if (!imageData) continue;

                // Handle data URLs (base64 encoded images)
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

    // If no content array was created, use simple text content
    if (userMessage.content.length === 0) {
        userMessage.content = content || "";
    }

    // Create the messages array
    const messages = [
        {
            role: "system",
            content: `You are an research paper assistant. 
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
                - Avoid verbose responses unless explicitly requested.`
        },
        userMessage
    ];

    // Add PDF content if exists
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
            model: "gpt-4-turbo-preview",
            messages: messages,
            max_tokens: 4096,
            temperature: 0.7,
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
        // Return more detailed error message for debugging
        return {
            id: messageId,
            display: <BotMessagePer 
                content={`Error: ${error.message}\nType: ${error.type}\nCode: ${error.code}`}
            />
        };
    }
}