import React, { useState, useEffect } from "react";

interface LoaderProps {
    messages: string[];
    interval?: number; // Interval in milliseconds
}

const messages = [
    "Unpacking your request...",
    "Connecting to my sources...",
    "Gathering data...",
    "Analyzing patterns...",
    "Preparing final output...",
];
const interval = 1500;

const LoaderAi: React.FC<LoaderProps> = () => {
    const [currentMessage, setCurrentMessage] = useState<string>('');
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [charIndex, setCharIndex] = useState<number>(0);
    const [isTyping, setIsTyping] = useState<boolean>(true); 

    useEffect(() => {
        const loaderInterval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const nextIndex = prevIndex + 1;
                if (nextIndex >= messages?.length) {
                    clearInterval(loaderInterval);
                }
                return nextIndex;
            });
        }, interval);

        return () => clearInterval(loaderInterval);
    }, [messages, interval]);

    useEffect(() => {
        setCharIndex(0);
        setIsTyping(true);

        const typingEffect = setInterval(() => {
            if (charIndex < messages[currentIndex]?.length) {
                setCharIndex((prev) => prev + 1);
            } else {
                clearInterval(typingEffect);
                setIsTyping(false); // Finish typing after the message is done
            }
        }, 100); // Typing speed (adjust as needed)

        return () => clearInterval(typingEffect);
    }, [currentIndex]);

    useEffect(() => {
        setCurrentMessage(messages[currentIndex]?.slice(0, charIndex));
    }, [charIndex, currentIndex]);

    return (
        <div style={{ fontSize: "15px", whiteSpace: "nowrap" , color: "gray", fontStyle: "italic" }}>
            {currentMessage}
            {isTyping && <span className="blink">|</span>} 
        </div>
    );
};

export default LoaderAi;
