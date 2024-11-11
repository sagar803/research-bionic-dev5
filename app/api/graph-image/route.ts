import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const maxDuration = 300;

// 'file-owIxKTdP36ilwGqU3jQcy4aS'

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url)
  const fileId = searchParams.get('fileId');
  if(!fileId || fileId === "") {
    return NextResponse.json({error: "Invalid file id"}, {status: 401})
  }

  try {
    
    const response = await fetch(
      `https://api.openai.com/v1/files/${fileId}/content`,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    )

    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText)
    }

    const arrayBuffer = await response.arrayBuffer()

    const headers = new Headers({
      'Content-Type': 'application/octet-stream'
    })

    return new NextResponse(arrayBuffer, {
      headers,
      status: 200
    })
  } catch (error) {
    console.log('error', error)
    return NextResponse.json({ error: 'internal server error' }, { status: 500 })
  }
}
