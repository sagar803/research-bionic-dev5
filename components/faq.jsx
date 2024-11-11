import { useState } from 'react';
import Link from 'next/link';

const Faq = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOverlay = () => {
        setIsOpen(!isOpen);
    };

    const closeOverlay = (e) => {
        if (e.target.id === "overlay") {
            setIsOpen(false);
        }
    };

    return (
        <div>
            <Link href="#" onClick={toggleOverlay} className="text-black underline text-sm font-medium">
                FAQ
            </Link>

            {isOpen && (
                <div id="overlay" className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center" onClick={closeOverlay}>
                    <div className="relative w-full max-w-4xl mx-auto p-4 bg-white rounded-lg overflow-y-auto" style={{ width: '70%', maxHeight: '90vh', overflowY: 'auto',  border: '5px solid gray', // Set border width and color
                        borderRadius: '20px', marginTop:'80px'}}>


                        <div className="p-4 space-y-6">
                            <h2 className="text-2xl font-bold">FAQ</h2>
                            <button onClick={toggleOverlay} className="absolute top-4 right-4 text-black">
                                ✖
                            </button>
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">What is this app for?</h3>
                                <p>This app allows you to interact with various AI models for text generation, enabling you to create and refine text content efficiently.</p>

                                <h3 className="text-xl font-semibold">What models are available?</h3>
                                <ul className="list-disc list-inside">
                                    <li><strong>GPT-3.5:</strong> Known for its balance of efficiency and quality in generating human-like text.</li>
                                    <li><strong>GPT-4:</strong> An advanced version with improved capabilities for understanding and generating text with higher accuracy and coherence.</li>
                                    <li><strong>GPT-4 Turbo:</strong> A faster variant of GPT-4, providing quicker responses while maintaining high-quality outputs.</li>
                                    <li><strong>GPT-4o:</strong> An optimized version for specific tasks requiring refined text generation.</li>
                                    <li><strong>Llama 3:</strong> Designed for lightweight and efficient text generation, suitable for quick tasks.</li>
                                    <li><strong>Gemini:</strong> Excels in generating creative and diverse text outputs, ideal for brainstorming and content creation.</li>
                                </ul>

                                <h3 className="text-xl font-semibold">How do I choose the right model?</h3>
                                <p>Choose the model based on your specific needs: GPT-3.5 for general purposes, GPT-4 for complex generation, GPT-4 Turbo for quick high-quality responses, GPT-4o for optimized tasks, Llama 3 for quick tasks, and Gemini for creative content.</p>

                                <h3 className="text-xl font-semibold">How do I use this app?</h3>
                                <ol className="list-decimal list-inside">
                                    <li>Select the model from the dropdown menu that suits your needs.</li>
                                    <li>Type your prompt or question in the text box provided.</li>
                                    <li>Click Create to generate the text output based on the selected model and entered prompt.</li>
                                </ol>

                                <h2 className="text-2xl font-bold">How-To</h2>
                                <h3 className="text-xl font-semibold">Creating Text</h3>
                                <ol className="list-decimal list-inside">
                                    <li>Select Model: Choose the model that best fits your text generation needs (e.g., GPT-4 for detailed responses).</li>
                                    <li>Enter Prompt: Type a detailed prompt or question to guide the text generation, like Write a short story about a brave knight.</li>
                                    <li>Click Create: Generate your text. The model will process your prompt and provide a text output.</li>
                                </ol>

                                <h3 className="text-xl font-semibold">Additional Tips</h3>
                                <ul className="list-disc list-inside">
                                    <li>Experiment with Prompts: Try different descriptions to see how the model responds.</li>
                                    <li>Use Detailed Descriptions: More detailed prompts usually yield better results.</li>
                                    <li>Model Comparison: Experiment with different models for the same prompt to compare outputs and select the best one for your needs.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export { Faq };
