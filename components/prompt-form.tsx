import { useModel } from '@/app/context/ModelContext'
import { Faq } from '@/components/faq'
import { Button } from '@/components/ui/button'
import {
  IconArrowElbow,
  IconPlus,
  IconTrash,
  IconsDocument,
  SpinnerIcon
} from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { type AI } from '@/lib/chat/actions'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { useActions, useUIState } from 'ai/rsc'
import axios from 'axios'
import imageCompression from 'browser-image-compression'
import { nanoid } from 'nanoid'
import * as React from 'react'
import Textarea from 'react-textarea-autosize'
import { toast } from 'sonner'
import { SpinnerMessage, UserMessage } from './stocks/message'
import { useGlobalState } from '@/context/GlobalContext';
import { Card } from './ui/card'
import PdfReader from './PdfReader'

export function PromptForm({
  input,
  setInput
}: {
  input: string
  setInput: (value: string) => void
}) {

  // @ts-ignore
  const {uploadedPdfUrls, setUploadedUrls} = useGlobalState()

  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { submitUserMessage } = useActions()
  const [messages, setMessages] = useUIState<typeof AI>()
  const [uploadedImages, setUploadedImages] = React.useState<string[]>([])

  //Adding Pdf files
  const [uploadedPdfFiles, setUploadedPdfFiles] = React.useState<
    {
      text: string
      name: string
      url :string
    }[]
  >([])

  const [uploadingCSVFiles, setUploadingCSVFiles] = React.useState<
    { name: string; text: string }[]
  >([])

  const [isUploading, setIsUploading] = React.useState(false)

  const { model } = useModel()

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const fileRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) {
      toast.error('No file selected')
      return
    }

    const files = Array.from(event.target.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    //For checking Pdf files
    const pdfFiles = files.filter(file =>
      file.type.startsWith('application/pdf')
    )

    //For checking csv files
    const csvFiles = files.filter(file => file.type.startsWith('text/csv'))

    // Checking for pdf and images
    if (
      imageFiles.length <= 0 &&
      pdfFiles.length <= 0 &&
      csvFiles.length <= 0
    ) {
      return toast.error('Only CSV, Pdf and Images are allowed.')
    }

    setIsUploading(true)

    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        try {
          // Compress the image before encoding it
          const compressedFile = await compressImage(file)

          const reader = new FileReader()
          reader.onerror = () => {
            toast.error('Failed to read file')
          }

          reader.onloadend = () => {
            const base64String = reader.result as string
            if (!base64String) {
              toast.error('Failed to encode file')
              return
            }
            setUploadedImages(prevImages => [...prevImages, base64String])
          }

          reader.readAsDataURL(compressedFile)
        } catch (error) {
          toast.error('Failed to compress file')
        }
      }
    }
    if (pdfFiles.length > 0) {
      for (const file of pdfFiles) {
        const fileName = file.name
        const fileUrl = URL.createObjectURL(file)
        const formData = new FormData()
        formData.append('file', file)
        try {
          const res = await axios.post('/api/upload/pdf-to-text', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          if (res.data?.text) {
            setUploadedPdfFiles(prev => [
              ...prev,
              { name: fileName, text: res.data.text, url:fileUrl }
            ])

            // @ts-ignore
            setUploadedUrls({ name: fileName, text: res.data.text, url:fileUrl })
          }
        } catch (error) {
          toast.error('Error uploading pdf file.')
        }
      }
    }

    if (csvFiles && csvFiles.length > 0) {
      for (const file of csvFiles) {
        const fileName = file.name
        const formData = new FormData()
        formData.append('csv', file)

        try {
          const res = await axios.post('/api/upload/csv-to-text', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          if (res.data?.text) {
            setUploadingCSVFiles(prev => [
              ...prev,
              { name: fileName, text: res.data.text }
            ])
          }
        } catch (error) {
          toast.error('Error uploading csv file.')
        }
      }
    }
    setIsUploading(false)
  }

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 0.5, // Compress to a smaller size if necessary
      maxWidthOrHeight: 1920,
      useWebWorker: true
    }

    try {
      const compressedFile = await imageCompression(file, options)
      return compressedFile
    } catch (error) {
      console.error('Error compressing the image:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (window.innerWidth < 600) {
      e.currentTarget['message']?.blur()
    }

    const value = input.trim()
    setInput('')
    if (!value && uploadedImages.length === 0) return

    const combinedContent = (
      <div className="flex flex-col gap-2">
        <p>{value}</p>
        {uploadedImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt="Uploaded"
            className="max-w-full h-auto rounded-lg"
          />
        ))}
        {uploadedPdfFiles.map((val, index) => {
          return (
            <div
              key={index}
              className="bg-zinc-200 flex items-center p-2 rounded-xl gap-2"
            >
              <span className="bg-white p-2 rounded-lg flex items-center justify-center">
                <IconsDocument />
              </span>
              <span>{val.name}</span>
            </div>
          )
        })}
        {uploadingCSVFiles.map((val, index) => {
          return (
            <div
              key={index}
              className="bg-zinc-200 flex items-center p-2 rounded-xl gap-2"
            >
              <span className="bg-white p-2 rounded-lg flex items-center justify-center">
                <IconsDocument />
              </span>
              <span>{val.name}</span>
            </div>
          )
        })}
      </div>
    )

    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        display: <UserMessage>{combinedContent}</UserMessage>
      }
    ])

    try {
      // Create the payload with the compressed and encoded images
      const payload = {
        message: value,
        model: model,
        images: uploadedImages,
        file: uploadedPdfFiles,
        csv: uploadingCSVFiles
      }

      // Log the JSON payload
      console.log('Sending JSON payload:', JSON.stringify(payload))

      const responseMessage = await submitUserMessage(
        value,
        model,
        uploadedImages,
        uploadedPdfFiles,
        uploadingCSVFiles
      )
      console.log(uploadingCSVFiles)
      setUploadedImages([])
      setUploadedPdfFiles([])
      setUploadingCSVFiles([])
      setMessages(currentMessages => [...currentMessages, responseMessage])
    } catch (error) {
      console.error('Error submitting message:', error)
      toast(
        <div className="text-red-600">
          You have reached your message limit! Please try again later, or{' '}
          <a
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
            href="https://vercel.com/templates/next.js/gemini-ai-chatbot"
          >
            deploy your own version
          </a>
          .
        </div>
      )
    }
  }

  const canUploadAttachments = [
    'gpt-4',
    'gpt-4-turbo',
    'gpt-4o-2024-05-13'
  ].includes(model)

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input
        type="file"
        className="hidden"
        id="file"
        ref={fileRef}
        // accept="images/*"
        onChange={handleFileChange}
        multiple
      />
      <div className="relative flex w-full items-center bg-zinc-100 px-6 sm:rounded-full sm:px-6">
        {canUploadAttachments && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="size-8 cursor-pointer rounded-full bg-background p-0 flex items-center justify-center"
                onClick={() => {
                  if (isUploading) {
                    return
                  }
                  fileRef.current?.click()
                }}
              >
                <IconPlus />
                <span className="sr-only">New Chat</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>Add Attachments</TooltipContent>
          </Tooltip>
        )}
        <div className="relative mt-2 mb-2 ml-2 flex justify-center space-x-2">
          {uploadedImages.length > 0 && (
            <>
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt="Uploaded"
                    className="w-12 h-12 object-cover rounded-full border"
                  />
                  <span
                    className="absolute top-0 right-0 z-10 text-red-500 bg-white rounded-full p-1 cursor-pointer"
                    onClick={() =>
                      setUploadedImages(prevImages =>
                        prevImages.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <IconTrash className="w-4 h-4" />
                    <span className="sr-only">Remove image</span>
                  </span>
                </div>
              ))}
            </>
          )}
          {uploadedPdfFiles.map((_, index) => {
            return (
              <div
                key={index}
                className="relative h-12 w-12 flex items-center justify-center bg-black mx-1 rounded-lg "
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute  text-red-500 bg-white rounded-full p-1"
                  onClick={() => {
                    setUploadedPdfFiles(prevFile =>
                      prevFile.filter((_, i) => i !== index)
                    )

                    if(uploadedPdfFiles && uploadedPdfFiles.length >= 1) {
                      setUploadedUrls(uploadedPdfFiles[uploadedPdfFiles.length - 1])
                    }
                    setUploadedUrls(null)
                  }}
                >
                  <IconTrash className="w-4 h-4" />
                  <span className="sr-only">Remove PDF</span>
                </Button>
              </div>
            )
          })}
          {isUploading && (
              <div
              className="relative h-12 w-12 flex items-center justify-center bg-black mx-1 rounded-lg "
            >
              <Button
                variant="outline"
                size="icon"
                className="absolute  text-red-500 bg-white rounded-full p-1"
              >
                <SpinnerIcon />
                <span className="sr-only">Uploading PDF</span>
              </Button>
            </div>
          )}
          {uploadingCSVFiles.map((_, index) => {
            return (
              <div
                key={index}
                className="relative h-12 w-12 flex items-center justify-center bg-black mx-1 rounded-lg "
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute  text-red-500 bg-white rounded-full p-1"
                  onClick={() => {
                    setUploadingCSVFiles(prevFile =>
                      prevFile.filter((_, i) => i !== index)
                    )
                  }}
                >
                  <IconTrash className="w-4 h-4" />
                  <span className="sr-only">Remove CSV</span>
                </Button>
              </div>
            )
          })}
        </div>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Message Bionic Research"
          className="flex-1 min-h-[60px] bg-transparent placeholder:text-zinc-900 resize-none px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="submit"
              size="icon"
              disabled={input === '' && uploadedImages.length === 0}
              className="bg-transparent shadow-none text-zinc-950 rounded-full hover:bg-zinc-200"
            >
              <IconArrowElbow />
              <span className="sr-only">Send message</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Send message</TooltipContent>
        </Tooltip>
      {uploadedPdfUrls && <PdfReader pdfUrls={uploadedPdfUrls} />}
      </div>

      <p className="text-xs text-gray-300 ml-4 transition-opacity duration-300 ease-in-out text-center mt-2">
        {'Models may make mistakes, always validate your work'}
      </p>
      <p className="text-xs text-gray-300 ml-4 transition-opacity duration-300 ease-in-out text-center">
        {['gemma-7b-it', 'mixtral-8x7b-32768'].includes(model)
          ? '❗Prone to rate limits'
          : ''}
      </p>
      <div className="flex justify-end max-w-5xl mx-auto">
        <Faq />
      </div>
    </form>
  )
}
