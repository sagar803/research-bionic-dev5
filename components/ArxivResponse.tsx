// @ts-nocheck
"use client"

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useGlobalState } from '@/context/GlobalContext';

export const ArxivResponse = ({ papers }) => {

  const { selectedPdfUrl, setSelectedPdfUrl,pdfName, setPdfName } = useGlobalState();

  return (
    <div>
      {papers.map((paper, index) => (
        <Card key={index} className="mb-4">
          <CardHeader>
            <CardTitle>{paper.title}</CardTitle>
            <CardDescription>{paper.authors.join(', ')}</CardDescription>
            {/* <CardDescription>{paper.published.substring(0, 10)}</CardDescription> */}
            </CardHeader>
          <CardContent>
            <p>{paper.summary}</p>
          </CardContent>
          <CardFooter className='flex gap-2'>
            <Button><a target='_blank' href={paper.links[0].href}>View on arXiv</a></Button>
            <Button onClick={() => {
              setPdfName({title: paper.title, author: paper.authors[0]})
              setSelectedPdfUrl(paper.links[1].href)
            }}
            >View PDF</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ArxivResponse;
