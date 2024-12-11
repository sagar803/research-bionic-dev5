import React from 'react';
import { Brain, Bot, Lightbulb, FileText, LucideIcon, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Model {
  id: 'openai' | 'gpto1' | 'claude' | 'perplexity' | 'arxiv';
  name: string;
  icon: LucideIcon;
}

interface ModelSelectorsProps {
  selectedModel: any;
  onModelSelect: (modelId: Model['id']) => void;
}

const models: Model[] = [
  { id: 'openai', name: 'ChatGPT', icon: Brain },
  { id: 'gpto1', name: 'GPT o1', icon: Brain },
  { id: 'claude', name: 'Claude', icon: Bot },
  { id: 'perplexity', name: 'Perplexity', icon: Lightbulb },
  { id: 'arxiv', name: 'arXiv', icon: FileText }
];
const BoxIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.9969 3.39017C14.5497 2.17402 15.961 1.60735 17.2013 2.10349L19.4045 2.98474C20.7337 3.51645 21.3458 5.05369 20.7459 6.35358L19.0629 10H20C20.5523 10 21 10.4477 21 11V19C21 20.6569 19.6569 22 18 22H6C4.34315 22 3 20.6569 3 19V11C3 10.4504 3.44331 10.0044 3.99184 10L3.84326 9.89871C3.83308 9.89177 3.82303 9.88464 3.81312 9.87733C2.55918 8.9526 2.79737 7.01262 4.23778 6.4187L6.35774 5.5446L7.08184 3.36882C7.57383 1.8905 9.49247 1.51755 10.5024 2.70393L11.9888 4.45002L13.5103 4.46084L13.9969 3.39017ZM15.5096 4.89554C16.2552 5.48975 16.5372 6.5938 15.9713 7.51403L14.8266 9.37513C14.8265 9.38763 14.8266 9.40262 14.8273 9.42012C14.8294 9.47124 14.8357 9.52793 14.8451 9.58261C14.8548 9.63855 14.8654 9.67875 14.8714 9.69773C14.9032 9.79818 14.9184 9.89994 14.9184 10H16.8602L18.93 5.51547C19.0499 5.25549 18.9275 4.94804 18.6617 4.8417L16.4585 3.96044C16.2105 3.86121 15.9282 3.97455 15.8177 4.21778L15.5096 4.89554ZM12.8885 10C12.8572 9.84121 12.8358 9.66998 12.829 9.50115C12.8194 9.26482 12.8255 8.81125 13.0664 8.41953L14.2677 6.46628L11.9746 6.44997C11.3934 6.44584 10.8427 6.18905 10.4659 5.74646L8.97951 4.00037L8.25541 6.17614C8.07187 6.72765 7.65748 7.17203 7.12012 7.39359L5.00092 8.26739L7.06339 9.67378C7.19189 9.7614 7.29353 9.87369 7.36631 10H12.8885ZM5 12V19C5 19.5523 5.44772 20 6 20H18C18.5523 20 19 19.5523 19 19V12H5ZM9.5 14.5C9.5 13.9477 9.94772 13.5 10.5 13.5H13.5C14.0523 13.5 14.5 13.9477 14.5 14.5C14.5 15.0523 14.0523 15.5 13.5 15.5H10.5C9.94772 15.5 9.5 15.0523 9.5 14.5Z" fill="currentColor"></path></svg>
  );

const ModelSelectors: React.FC<ModelSelectorsProps> = ({ selectedModel, onModelSelect }) => {
  return (
    <div className="flex items-center gap-2">
      {/* Current Model Display */}
      <div className="size-8 rounded-full ml-2 bg-background p-0 flex items-center justify-center">
        {React.createElement(
          models.find(m => m.id === selectedModel)?.icon || Brain, 
          { className: "h-4 w-4" }
        )}
      </div>

      {/* Model Selector Dropdown */}
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger 
              className="size-8 cursor-pointer rounded-full bg-background p-0 flex items-center justify-center hover:bg-zinc-100 transition-colors"
            >
               <BoxIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="w-48 border-2 rounded-xl p-1 bg-white shadow-lg"
            >
              {models.map((model) => (
                <DropdownMenuItem 
                  key={model.id}
                  onClick={() => onModelSelect(model.id)}
                  className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
                    selectedModel === model.id 
                      ? 'bg-gray-100' 
                      : 'hover:bg-zinc-100'
                  }`}
                >
                  {React.createElement(model.icon, { 
                    className: `h-4 w-4 ${
                      selectedModel === model.id 
                        ? 'text-blue-900' 
                        : ''
                    }` 
                  })}
                  <span>{model.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>Select Model</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default ModelSelectors;