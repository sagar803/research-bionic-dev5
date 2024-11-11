'use client';

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useActions, useUIState } from 'ai/rsc';

import type { AI } from '@/lib/chat/actions';

export function DateSelect() {
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  // const [customDate, setCustomDate] = React.useState<string>('');
  const [, setMessages] = useUIState<typeof AI>();
  // @ts-ignore
  const { submitUserMessage } = useActions<typeof AI>();

  console.log(selectedDate)

  const predefinedRanges = [
    'Past 3 months',
    'Past 6 months',
    'Past 12 months',
    'Greater than 1 year'
  ];

  const calculatePastDate = (range: string): string => {
    const today = new Date();
    switch (range) {
      case 'Past 3 months':
        return new Date(today.setMonth(today.getMonth() - 3)).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit' });
      case 'Past 6 months':
        return new Date(today.setMonth(today.getMonth() - 6)).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit' });
      case 'Past 12 months':
        return new Date(today.setFullYear(today.getFullYear() - 1)).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit' });
      case 'Greater than 1 year':
        return new Date(today.setFullYear(today.getFullYear() - 2)).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit' });
      default:
        return today.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
  };

  const query = `the selected date is ${selectedDate}, now display the research papers`;
  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await submitUserMessage(query);
    setMessages(currentMessages => [...currentMessages, response]);
  };

  const handleSelect = (range: string) => {
    setSelectedDate(calculatePastDate(range));
  };

  // const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const date = e.target.value;
  //   if (/^\d{4}-(0[1-9]|1[0-2])$/.test(date)) {
  //     setSelectedDate(date);
  //   } else {
  //     setSelectedDate(null); // Reset if the format is incorrect
  //   }
  //   setCustomDate(date);
  // };

  return (
    <form>
      <div className="space-y-2">
        <div className="mt-2 max-h-60 overflow-auto">
          {predefinedRanges.map(range => (
            <div
              key={range}
              className={`m-1 cursor-pointer p-2 hover:bg-gray-200 border rounded-lg ${selectedDate == calculatePastDate(range) ? 'bg-gray-200' : ''}`}
              onClick={() => handleSelect(range)}
            >
              {range}
            </div>
          ))}
          {/* <div className="mt-4">
            <Input
              type="month"
              placeholder="YYYY-MM"
              value={customDate}
              onChange={handleCustomDateChange}
            />
          </div> */}
        </div>
      </div>
      <input type="hidden" name="selected_date" value={selectedDate || ''} />
      <Button disabled={!selectedDate} onClick={handleSubmit} className="mt-4">Submit</Button>
    </form>
  );
}
