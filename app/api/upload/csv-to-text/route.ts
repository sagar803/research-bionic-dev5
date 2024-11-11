import { NextResponse } from 'next/server'
import { Readable } from 'stream'

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const csvFile: File | null = data.get('csv') as unknown as File

    if (!csvFile) {
      return NextResponse.json(
        { error: 'Please upload a file' },
        { status: 400 }
      )
    }

    const arrayBuffer = await csvFile.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer).toString()
    const text = await readCSV(fileBuffer)

    return NextResponse.json({ message: 'Success', text })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Internal Server Error.' },
      { status: 500 }
    )
  }
}

async function readCSV(bufferStr:string):Promise<string> {
  return new Promise((res, rej) => {
    const readableFrom = Readable.from(bufferStr)
    readableFrom
      .on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split(/\r?\n/)
        const text = JSON.stringify(lines)
        res(text)
      }).on("error", () => {
        rej("Couldn't read CSV file.")
      })

  })
}
