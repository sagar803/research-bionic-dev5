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
import { Send, Brain, Bot, Lightbulb, FileText } from 'lucide-react'
import { type AI } from '@/lib/chat/actions'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { useActions, useUIState } from 'ai/rsc'
import axios from 'axios'
import imageCompression from 'browser-image-compression'
import { nanoid } from 'nanoid'
import * as React from 'react'
import Textarea from 'react-textarea-autosize'
import { toast } from 'sonner'
import { BotMessage, BotMessagePer, SpinnerMessage, UserMessage } from './stocks/message'
import { useGlobalState } from '@/context/GlobalContext'
import { Card } from './ui/card'
import PdfReader from './PdfReader'
import { ChatStorage } from '@/lib/chatStorage'
import { signIn, useSession } from 'next-auth/react'
import { DialogLogin } from './LoginModal'
import { useChat } from '@/lib/hooks/use-generate-chatid'
import { ModelSelector } from './model-selector'
import ModelSelectors from './ModelSelector'

export function PromptForm({
  input,
  setInput
}: {
  input: string
  setInput: (value: string) => void
}) {
  // @ts-ignore
  const { uploadedPdfUrls, setUploadedUrls } = useGlobalState()
  const [selectedModel, setSelectedModel] = React.useState('openai')
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const {
    submitUserMessage,
    sendMessageToClaude,
    sendMessageToPerplexity,
    sendMessageToOpenAI,
    sendMessageToOpenAIo1
  } = useActions()
  const [loading, setLoading] = React.useState(false)
  const { data: session, status }: any = useSession()
  const [messages, setMessages] = useUIState<typeof AI>()
  const [uploadedImages, setUploadedImages] = React.useState<string[]>([])
  const [guestmode, setGuestmode] = React.useState(false)
  const [messagesLast, setMessagesLast] =React.useState<string[]>([]);
  const [chatUpdateTrigger, setChatUpdateTrigger] = React.useState(0);
  const { generateNewChatId , setCurrentChatId , currentChatId  , setUpdateSiebar , updateSiebar} = useChat();
  const [guestId, setGuestId] = React.useState<string>('')
  const loginAzure = () => {
    signIn('azure-ad')
  }
  //Adding Pdf files
  const [uploadedPdfFiles, setUploadedPdfFiles] = React.useState<
    {
      text: string
      name: string
      url: string
    }[]
  >([])

  const [uploadingCSVFiles, setUploadingCSVFiles] = React.useState<
    { name: string; text: string }[]
  >([])

  const [isUploading, setIsUploading] = React.useState(false)

  const { model } = useModel()

  React.useEffect(() => {
    if (guestmode && !guestId) {
      setGuestId(`guest_${nanoid()}`)
    }
  }, [guestmode])


  // React.useEffect(() => {
  //   const loadUserChats = async () => {
  //     const userId = guestmode ? guestId : session?.user?.id
  //     if (userId && selectedModel) {
      
  //         const chatHistory = await ChatStorage.getModelChat(
  //           userId,
  //           selectedModel
  //         ) || []; 
  //         if (!Array.isArray(chatHistory)) {
  //           setMessagesLast([]);
  //           setMessages([]);
  //           return;
  //         }
  //         try {
  //           const extractedMessages = [];
            
  //           if (chatHistory) {
  //             for (const msg of chatHistory || []) {
  //               try {
  //                 if (!msg) continue;
                  
  //                 const userMessage = msg?.display?.props?.children?.props?.children?.[0]?.props?.children;
  //                 if (userMessage) {
  //                   extractedMessages.push(userMessage);
  //                   continue;
  //                 }
          
  //                 const botMessage = msg?.display?.props?.content;
  //                 if (botMessage) {
  //                   extractedMessages.push(botMessage);
  //                   continue;
  //                 }
  //               } catch (messageError) {
  //                 continue;
  //               }
  //             }
          
  //             const lastMessages = extractedMessages?.slice(-4);
  //             console.log("Last 4 messages:", lastMessages);
          
  //             let totalChars = 0;
  //             const limitedMessages = [];
              
  //             for (const msg of lastMessages) {
  //               if (msg && totalChars + msg.length <= 200) {
  //                 limitedMessages.push(msg);
  //                 totalChars += msg.length;
  //               } else {
  //                 break;
  //               }
  //             }
          
  //             setMessagesLast(limitedMessages || []);
  //           } else {
  //             setMessagesLast([]);
  //           }
  //         } catch (error) {
  //           setMessagesLast([]);
  //           console.log("error in extract" , error)
  //         }
  //         try {
  //           if(chatHistory){
  //         const uiMessages: any = chatHistory
  //           ?.map(msg => {
             
  //             if (msg?.display?.props?.content) {
  //               return {
  //                 id: msg?.id,
  //                 display: React.createElement(BotMessagePer, {
  //                   content: msg?.display?.props.content,
  //                   resultlinks: msg?.display?.props.resultlinks || []
  //                 })
  //               }
  //             }

  //             // For user messages
  //             const messageContent =
  //               msg.display?.props?.children?.props?.children?.[0]?.props
  //                 ?.children
  //             if (messageContent) {
  //               return {
  //                 id: msg.id,
  //                 display: React.createElement(
  //                   UserMessage,
  //                   null,
  //                   React.createElement(
  //                     'div',
  //                     { className: 'flex flex-col gap-2' },
  //                     React.createElement('p', null, messageContent)
  //                   )
  //                 )
  //               }
  //             }

  //             return null
  //           })
  //           .filter(Boolean)

  //         setMessages(uiMessages)}
  //       } catch (error) {
  //         console.error('Error loading chat history:', error)
  //       }
  //     }
  //   }

  //   loadUserChats()
  // }, [session?.user?.id, selectedModel, guestmode, guestId  , chatUpdateTrigger])

  React.useEffect(() => {
    const loadChatMessages = async () => {
      try {
        const userId = guestmode ? guestId : session?.user?.id;
        if (!userId || !currentChatId) return;
  
  
        const chatMessages = await ChatStorage.getChatMessages(userId, currentChatId);
        setUpdateSiebar(!updateSiebar)
        if (!chatMessages?.length) {
          setMessages([]);
          setMessagesLast([]);
          return;
        }
  
        // Process messages for UI
        const uiMessages:any = chatMessages.map(msg => {
          // For bot messages
          if (msg?.display?.props?.content) {
            return {
              id: msg.id,
              display: React.createElement(BotMessagePer, {
                content: msg.display.props.content,
                resultlinks: msg.display.props.resultlinks || []
              })
            };
          }
  
          // For user messages
          const messageContent = msg?.display?.props?.children?.props?.children?.[0]?.props?.children;
          if (messageContent) {
            return {
              id: msg.id,
              display: React.createElement(
                UserMessage,
                null,
                React.createElement(
                  'div',
                  { className: 'flex flex-col gap-2' },
                  React.createElement('p', null, messageContent)
                )
              )
            };
          }
  
          return null;
        }).filter(Boolean);
  
        setMessages(uiMessages);
  
        // Process last 4 messages for context
        const extractedMessages = chatMessages
          .map(msg => {
            const userMessage = msg?.display?.props?.children?.props?.children?.[0]?.props?.children;
            const botMessage = msg?.display?.props?.content;
            return userMessage || botMessage;
          })
          .filter(Boolean);
  
        const lastMessages = extractedMessages.slice(-4);
        
        // Limit context to 200 characters
        let totalChars = 0;
        const limitedMessages = [];
        for (const msg of lastMessages) {
          if (msg && totalChars + msg.length <= 200) {
            limitedMessages.push(msg);
            totalChars += msg.length;
          } else {
            break;
          }
        }
  
        setMessagesLast(limitedMessages);
  
      } catch (error) {
        console.error('Error loading chat messages:', error);
        setMessages([]);
        setMessagesLast([]);
      } finally {
  
      }
    };
  
    loadChatMessages();
  }, [currentChatId, session?.user?.id, guestmode, guestId]);

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
              { name: fileName, text: res.data.text, url: fileUrl }
            ])

            // @ts-ignore
            setUploadedUrls({
              name: fileName,
              text: res.data.text,
              url: fileUrl
            })
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
      maxSizeMB: 0.5,
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

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName)
  }
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true)
    e.preventDefault()
    const userId = guestmode ? guestId : session?.user?.id
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

    const userMessage = {
      id: nanoid(),
      display: <UserMessage>{combinedContent}</UserMessage>
    }
    if (session || guestmode) {
      try {
        await ChatStorage.saveChat(userId, userMessage ,  currentChatId ? currentChatId :"null")
      } catch (error) {
        console.error('Error saving chat:', error)
      }
    }
    setMessages(currentMessages => [...currentMessages, userMessage])

    try {
      const payload = {
        message: value,
        model: selectedModel,
        images: uploadedImages,
        file: uploadedPdfFiles,
        csv: uploadingCSVFiles
      }

      // Log the JSON payload
      console.log('Sending JSON payload:', JSON.stringify(payload))
      let responseMessage: any
      switch (selectedModel) {
        case 'claude':
          const msgiid = nanoid()
          setMessages(currentMessages => [
            ...currentMessages,
            {
              id: msgiid,
              display: <BotMessagePer content="" isLoading={true}/>
            }
          ])
          const responseclu = await sendMessageToClaude(
            value,
            uploadedImages,
            uploadedPdfFiles,
            uploadingCSVFiles,
            msgiid,
            messagesLast
          )

          setTimeout(async () => {
            setMessages(currentMessages =>
              currentMessages.map(msg =>
                msg?.id === msgiid
                  ? responseclu
                  : msg
              )
            )
          }, 2400)
          if (responseclu && (session || guestmode)) {
            try {
              await ChatStorage.saveChat(userId, responseclu, currentChatId ? currentChatId :"null")
              setChatUpdateTrigger(prev => prev + 1); 
            } catch (error) {
              console.error('Error saving claude response:', error)
            }
          }

          break
          case 'perplexity':
            const msgid = nanoid()
            
            // Show loading state
            setMessages(currentMessages => [
              ...currentMessages,
              {
                id: msgid,
                display: <BotMessagePer content="" isLoading={true} interval={2700} />
              }
            ])
          
            // Get response
            const response = await sendMessageToPerplexity(
              value,
              uploadedImages,
              uploadedPdfFiles,
              uploadingCSVFiles,
              msgid,
              messagesLast
            )
            
            // Set fallback response
            const responsetwo = { id: 1, text: 'Preparing final output...' }
          
            // Wait for loader sequence and static message duration
            await new Promise(resolve => setTimeout(resolve, 4800));
          
            // Show final response or fallback
            setMessages(currentMessages =>
              currentMessages.map(msg =>
                msg?.id === msgid ? (response ? response : responsetwo) : msg
              )
            )
          
            if (response && (session || guestmode)) {
              await ChatStorage.saveChat(userId, response, currentChatId ? currentChatId : "null")
              setChatUpdateTrigger(prev => prev + 1)
            }
          
            break

         
          case 'gpto1':
            const msgido1 = nanoid();
            
            // Show loading state
            setMessages(currentMessages => [
              ...currentMessages,
              {
                id: msgido1,
                display: <BotMessagePer content="" isLoading={true} interval={2700} />
              }
            ]);
          
            // Get response
            const responseo1 = await sendMessageToOpenAIo1(
              value,
              uploadedImages,
              uploadedPdfFiles,
              uploadingCSVFiles,
              msgido1,
              messagesLast
            );
          
            // After total delay show response
            await new Promise(resolve => setTimeout(resolve, 4000));
            
            setMessages(currentMessages =>
              currentMessages.map(msg =>
                msg?.id === msgido1 ? responseo1 : msg
              )
            );
          
            if (responseo1 && (session || guestmode)) {
              await ChatStorage.saveChat(userId, responseo1, currentChatId ? currentChatId : "null");
              setChatUpdateTrigger(prev => prev + 1);
            }
            break;
          
            case 'arxiv':
              const msgidar = nanoid();
             
            
              responseMessage = await submitUserMessage(
                value,
                model,
                uploadedImages,
                uploadedPdfFiles,
                uploadingCSVFiles,
                messagesLast
              )
           
            

              if (responseMessage && (session || guestmode)) {
                {
                  await ChatStorage.saveChat(userId, responseMessage, selectedModel)
                  setChatUpdateTrigger(prev => prev + 1); 
                }
              }
    
              break

  
        default:
          const msgiid4o = nanoid()
     
          // Show loading state
          setMessages(currentMessages => [
            ...currentMessages,
            {
              id: msgiid4o,
              display: <BotMessagePer content="" isLoading={true} interval={2700} />
            }
          ]);
          
          // Get response
          const response4o = await sendMessageToOpenAI(
            value,
            uploadedImages,
            uploadedPdfFiles,
            uploadingCSVFiles,
            msgiid4o,
            messagesLast
          );
          
          // Wait for loader sequence and static message duration
          await new Promise(resolve => setTimeout(resolve, 4800));
          
          // Show final response
          setMessages(currentMessages =>
            currentMessages.map(msg =>
              msg?.id === msgiid4o ? response4o : msg
            )
          );
          
          if (response4o && (session || guestmode)) {
            await ChatStorage.saveChat(userId, response4o, currentChatId ? currentChatId : "null");
            setChatUpdateTrigger(prev => prev + 1);
          }
      }

      console.log(uploadingCSVFiles)
      setUploadedImages([])
      setUploadedPdfFiles([])
      setUploadingCSVFiles([])
      setMessages(currentMessages => [...currentMessages, responseMessage])
      setTimeout(() => {
        setLoading(false)
      }, 5000)
    } catch (error) {
      setLoading(false)
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
    <>
      <DialogLogin
        loginAzure={loginAzure}
        session={session}
        setGuestmode={setGuestmode}
        guestmode={guestmode}
      />
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
      
              <>
              {selectedModel !== 'perplexity' &&
            selectedModel !== 'arxiv' &&
            selectedModel !== 'gpto1' &&
            canUploadAttachments && (    <Tooltip>
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
              </Tooltip> )}
                <ModelSelectors
                selectedModel={selectedModel} 
                onModelSelect={handleModelSelect}
              />
              </>
           
              
           

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

                      if (uploadedPdfFiles && uploadedPdfFiles.length >= 1) {
                        setUploadedUrls(
                          uploadedPdfFiles[uploadedPdfFiles.length - 1]
                        )
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
              <div className="relative h-12 w-12 flex items-center justify-center bg-black mx-1 rounded-lg ">
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
            className="flex-1 min-h-[60px] max-h-[200px] bg-transparent placeholder:text-zinc-900 
             resize-none px-4 py-[1.3rem] focus-within:outline-none sm:text-sm w-full
             overflow-y-auto scrollbar scrollbar-thumb-zinc-300 scrollbar-track-transparent"
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
              className="bg-black shadow-none hover:bg-gray-800 rounded-full"
              style={{background: "black"}}
            >
              <IconArrowElbow />
              <span className="sr-only">Send message</span>
            </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
          {uploadedPdfUrls && <PdfReader pdfUrls={uploadedPdfUrls} />}
        </div>
        {/* <div className="flex space-x-2 mx-8 my-3">
          <Button
            type="button"
            className={`flex-1 py-8 ${selectedModel === 'openai' ? 'bg-blue-100 hover:bg-blue-200' : ''}`}
            variant="outline"
            onClick={() => handleModelSelect('openai')}
          >
            <div className="flex flex-col items-center">
              <Brain className="h-3 w-3 mb-1 " />
              <span className="text-xs">ChatGPT</span>
            </div>
          </Button>
          <Button
            type="button"
            className={`flex-1 py-8 ${selectedModel === 'gpto1' ? 'bg-blue-100 hover:bg-blue-200' : ''}`}
            variant="outline"
            onClick={() => handleModelSelect('gpto1')}
          >
            <div className="flex flex-col items-center">
              <Brain className="h-3 w-3 mb-1 " />
              <span className="text-xs">GPT o1</span>
            </div>
          </Button>
          <Button
            type="button"
            className={`flex-1 py-8 ${selectedModel === 'claude' ? 'bg-blue-100 hover:bg-blue-200' : ''}`}
            variant="outline"
            onClick={() => handleModelSelect('claude')}
          >
            <div className="flex flex-col items-center">
              <Bot className="h-3 w-3 mb-1" />
              <span className="text-xs">Claude</span>
            </div>
          </Button>
          <Button
            type="button"
            className={`flex-1 py-8 ${selectedModel === 'perplexity' ? 'bg-blue-100 hover:bg-blue-200' : ''}`}
            variant="outline"
            onClick={() => handleModelSelect('perplexity')}
          >
            <div className="flex flex-col items-center">
              <Lightbulb className="h-3 w-3 mb-1" />
              <span className="text-xs">Perplexity</span>
            </div>
          </Button>
          <Button
            type="button"
            className={`flex-1 py-8 ${selectedModel === 'arxiv' ? 'bg-blue-100 hover:bg-blue-200' : ''}`}
            variant="outline"
            onClick={() => handleModelSelect('arxiv')}
          >
            <div className="flex flex-col items-center">
              <FileText className="h-3 w-3 mb-1" />
              <span className="text-xs">arXiv</span>
            </div>
          </Button>
        </div> */}
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
    </>
  )
}
