'use client';
import React, { useState } from "react";
import { useModel } from '@/app/context/ModelContext';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function ModelSelector() {
    const { model, setModel } = useModel(); // Access model state from context
    const [tooltipContent, setTooltipContent] = useState('');
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0 });

    const handleMouseEnter = (tooltip, e) => {
        const rect = e.target.getBoundingClientRect();
        setTooltipContent(tooltip);
        setTooltipPosition({ top: rect.top });
    };

    const handleValueChange = (value) => {
        setModel(value);
        setTooltipContent('');
    };

    return (
        <div className="relative">
            <Select defaultValue={model} onValueChange={handleValueChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Model</SelectLabel>
                        <SelectItem
                            value="gpt-3.5-turbo"
                            onMouseEnter={(e) => handleMouseEnter('Less creative, but fast', e)}
                            onMouseLeave={() => setTooltipContent('')}
                        >
                            GPT 3.5
                        </SelectItem>
                        <SelectItem
                            value="gpt-4"
                            onMouseEnter={(e) => handleMouseEnter('Highly creative, detailed responses', e)}
                            onMouseLeave={() => setTooltipContent('')}
                        >
                            GPT-4
                        </SelectItem>
                        <SelectItem
                            value="gpt-4-turbo"
                            onMouseEnter={(e) => handleMouseEnter('Very fast, great for quick tasks', e)}
                            onMouseLeave={() => setTooltipContent('')}
                        >
                            GPT-4 Turbo
                        </SelectItem>
                        <SelectItem
                            value="gpt-4o-2024-05-13"
                            onMouseEnter={(e) => handleMouseEnter('Balanced, excellent for analytics and data', e)}
                            onMouseLeave={() => setTooltipContent('')}
                        >
                            GPT-4o
                        </SelectItem>
                        <SelectItem
                            value="claude-3-5-sonnet-20240620"
                            onMouseEnter={(e) => handleMouseEnter('Smartest of them all.', e)}
                            onMouseLeave={() => setTooltipContent('')}
                        >
                            Claude 3.5 Sonnet
                        </SelectItem>
                        <SelectItem
                            value="llama3-70b-8192"
                            onMouseEnter={(e) => handleMouseEnter('Robust, handles large context well', e)}
                            onMouseLeave={() => setTooltipContent('')}
                        >
                            Llama 3
                        </SelectItem>
                        <SelectItem
                            value="gemini"
                            onMouseEnter={(e) => handleMouseEnter('Versatile, suitable for diverse tasks', e)}
                            onMouseLeave={() => setTooltipContent('')}
                        >
                            Gemini
                        </SelectItem>
                        <SelectItem
                            value="gemma-7b-it"
                            onMouseEnter={(e) => handleMouseEnter('❗Compact, efficient for smaller files', e)}
                            onMouseLeave={() => setTooltipContent('')}
                        >
                            Gemma
                        </SelectItem>
                        <SelectItem
                            value="mixtral-8x7b-32768"
                            onMouseEnter={(e) => handleMouseEnter('❗Innovative, ideal for creative projects', e)}
                            onMouseLeave={() => setTooltipContent('')}
                        >
                            Mixtral
                        </SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            {tooltipContent && (
                <div
                    className="absolute left-full ml-2 mt-[-1rem] bg-[#f4f4f5] text-black text-xs p-2 rounded w-64"
                    style={{ top: tooltipPosition.top }}
                >
                    {tooltipContent}
                </div>
            )}
        </div>
    );
}
