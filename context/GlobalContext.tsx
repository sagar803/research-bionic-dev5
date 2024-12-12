"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the type for your state
interface GlobalStateContextType {
  selectedPdfUrl: string | null;
  setSelectedPdfUrl: React.Dispatch<React.SetStateAction<string | null>>;
  pdfName: string | null;
  setPdfName: React.Dispatch<React.SetStateAction<string | null>>;
  uploadedPdfUrls: string[] | null;
  setUploadedUrls: React.Dispatch<React.SetStateAction<string[] | null>>;
  isOpenSidebar: boolean;
  setIsOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create a context with a default value of undefined
const GlobalStateContext = createContext<GlobalStateContextType | undefined>(
  undefined
);

// Provider component
export const GlobalStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [uploadedPdfUrls, setUploadedUrls] = useState<string[] | null>(null);
  const [isOpenSidebar, setIsOpenSidebar] = useState<boolean>(false);

  return (
    <GlobalStateContext.Provider
      value={{
        selectedPdfUrl,
        setSelectedPdfUrl,
        pdfName,
        setPdfName,
        uploadedPdfUrls,
        setUploadedUrls,
        isOpenSidebar,
        setIsOpenSidebar,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

// Hook for using global state
export const useGlobalState = (): GlobalStateContextType => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};
