// ModelContext.tsx
'use client'
import React, { createContext, useContext, useState } from 'react';

interface ModelContextType {
    model: string;
    setModel: (model: string) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [model, setModel] = useState<string>('gpt-4o-2024-05-13');  // Default model

    return (
        <ModelContext.Provider value={{ model, setModel }}>
            {children}
        </ModelContext.Provider>
    );
};

export const useModel = () => {
    const context = useContext(ModelContext);
    if (!context) {
        throw new Error('useModel must be used within a ModelProvider');
    }
    return context;
};
