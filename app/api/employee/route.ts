import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const maxDuration = 295

export const fileIds = [
  "file-a061E2Ikv1muG6JGrXQt85Pn"
]

interface RequestBody {
  prompt?: string
}

export async function POST(request: Request) {
  try {
    const { prompt } = (await request.json()) as RequestBody
    const files = ['file-a061E2Ikv1muG6JGrXQt85Pn']

    if (!prompt) {
      return NextResponse.json(
        { error: 'Please provide your required prompt' },
        { status: 400 }
      )
    }


    console.log('Files', files)

    const assistant = await openai.beta.assistants.create({
      instructions: `You are a helpful data assistant tool.
      You are a data analysis assistant. Please analyze the employee data provided in the CSV files
      The final response should contain the answer to the user's question or the requested graph.
      `,
      model: 'gpt-4o',
      tools: [{ type: 'code_interpreter' }],
      tool_resources: {
        code_interpreter: {
          file_ids: files
        }
      }
    })

    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: 'user',
          content: prompt,
          attachments: files.map(id => ({
            file_id: id,
            tools: [{ type: 'code_interpreter' }]
          }))
        }
      ]
    })

    let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
      instructions: `
      Please analyze provide csv file and give answer to the question. 
      Provide the answer in the last response.
      `

    })

    let result = ''
    let imageId = ''

    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(run.thread_id)
      for (const message of messages.data.reverse()) {
        // @ts-ignore
        console.log(`${message.role} > ${message.content[0]?.text?.value}`)
        if (message.role === 'assistant') {
          // @ts-ignore
          // result = message.content[0]?.text?.value
          for (const content of message.content) {
            // console.log("content", content)
            if (content.type === 'image_file') {
              imageId = content.image_file.file_id
            }
            if (content.type === 'text') {
              if (content.text.value) {
                result = content.text.value
              }
            }
          }
        }
      }
    } else {
      console.log(run.status)
      return NextResponse.json(
        { error: 'Open AI response error, Please try again.' },
        { status: 400 }
      )
    }

    if (result === '') {
      result = 'Please try again.'
    }

    return NextResponse.json({ message: result, imageId })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Internal Server Error.' },
      { status: 500 }
    )
  }
}
