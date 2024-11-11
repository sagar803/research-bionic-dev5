import { NextResponse } from 'next/server'
import { pdfToText } from 'pdf-ts'

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const pdfFile: File | null = data.get('file') as unknown as File
    const pdfUrl: string | null = data.get('url') as unknown as string

    if (!pdfFile && !pdfUrl) {
      return NextResponse.json(
        { error: 'Please upload a file or give a URL.' },
        { status: 400 }
      )
    }

    let buffer = null
    
    if (pdfUrl) {
      const res = await fetch(pdfUrl)
      if (!res.ok) {
        throw new Error('Please try again.')
      }
      buffer = await res.arrayBuffer()
    } else {
      buffer = await pdfFile.arrayBuffer()
    }

    const fileBuffer = Buffer.from(buffer)

    const text = await pdfToText(fileBuffer)

    return NextResponse.json({ message: 'Success', text })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Internal Server Error.' },
      { status: 500 }
    )
  }
}
