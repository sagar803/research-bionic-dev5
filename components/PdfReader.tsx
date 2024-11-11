'use client'
import React from 'react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { X } from 'lucide-react'

// @ts-ignore
export default function PdfReader({ pdfUrls }) {
  return (
    <Sheet>
      <SheetTrigger>
        <Button className="absolute -top-12 left-2">Open PDF</Button>
      </SheetTrigger>
      <SheetContent
        side={'bottom'}
        className="bg-black h-[90%] p-2 rounded-lg max-w-5xl mx-auto"
      >
        <embed
          src={pdfUrls?.url}
          // @ts-ignore
          allowFullScreen={true}
          zoom
          title="arXiv Paper"
          width="100%"
          height="100%"
        ></embed>
      </SheetContent>
    </Sheet>
  )
}
