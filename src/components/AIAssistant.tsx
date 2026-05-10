'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, User, Bot, Settings, CheckCircle2, AlertCircle } from 'lucide-react';
import { getLiveAIResponse, AIMessage } from '@/lib/ai';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<AIMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: 'Hi! I am connected to the live Groq API. Ask me anything to get started!',
            timestamp: 0,
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    // API Key Settings State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [keyStatus, setKeyStatus] = useState<'none' | 'valid' | 'invalid'>('none');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load API key from local storage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedKey = localStorage.getItem('groqApiKey');
            if (savedKey) {
                setApiKey(savedKey);
                setKeyStatus('valid'); // Assume valid if saved, but user can re-verify
            } else {
                setIsSettingsOpen(true); // Open settings by default if no key
            }
        }
    }, []);

    useEffect(() => {
        if (!isSettingsOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isSettingsOpen]);

    const handleVerifyAndSaveKey = async () => {
        if (!apiKey.trim()) {
            toast.error("Please enter an API key");
            return;
        }

        setIsVerifying(true);
        setKeyStatus('none');

        try {
            // Simple test call to verify the key
            await getLiveAIResponse([{ role: 'user', content: 'hello' }], apiKey.trim());
            
            // If successful
            localStorage.setItem('groqApiKey', apiKey.trim());
            setKeyStatus('valid');
            toast.success("API Key verified and saved successfully!");
            setTimeout(() => setIsSettingsOpen(false), 1500);
        } catch (error: any) {
            console.error("Verification failed:", error);
            setKeyStatus('invalid');
            toast.error(error.message || "Invalid API Key");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        if (!apiKey || keyStatus === 'invalid') {
            toast.error("Please provide a valid API key in Settings first.");
            setIsSettingsOpen(true);
            return;
        }

        const userMsg: AIMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputText,
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            // Prepare message history for the API
            const apiMessages = messages
                .filter(m => m.id !== 'welcome') // exclude welcome message from history
                .map(m => ({ role: m.role, content: m.content }))
                .concat({ role: 'user', content: userMsg.content });

            const responseContent = await getLiveAIResponse(apiMessages, apiKey.trim());
            
            const aiMsg: AIMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseContent,
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error: any) {
            console.error('AI Error:', error);
            const errorMsg: AIMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Error: ${error.message || 'Failed to connect to AI.'}`,
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, errorMsg]);
            if (error.message?.includes('API key')) {
                setKeyStatus('invalid');
                setIsSettingsOpen(true);
            }
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-20 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] bg-white dark:bg-card border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <Sparkles size={18} />
                                <span className="font-semibold">AI Assistant</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                    className={cn(
                                        "p-1.5 hover:bg-white/20 rounded-full transition-colors",
                                        isSettingsOpen && "bg-white/20"
                                    )}
                                    title="Settings"
                                >
                                    <Settings size={18} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        {isSettingsOpen ? (
                            // Settings View
                            <div className="flex-1 p-6 bg-gray-50 dark:bg-black/20 flex flex-col gap-4 overflow-y-auto">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">API Configuration</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Enter your free Groq API key to activate the live assistant. Your key is stored securely in your local browser storage.
                                </p>
                                
                                <div className="space-y-2 mt-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Groq API Key</label>
                                    <input 
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="gsk_..."
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none dark:bg-gray-800 dark:text-white"
                                    />
                                </div>

                                {keyStatus === 'valid' && (
                                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                                        <CheckCircle2 size={18} />
                                        <span className="text-sm font-medium">API Key is valid and active</span>
                                    </div>
                                )}

                                {keyStatus === 'invalid' && (
                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                                        <AlertCircle size={18} />
                                        <span className="text-sm font-medium">Invalid API Key. Please check and try again.</span>
                                    </div>
                                )}

                                <button 
                                    onClick={handleVerifyAndSaveKey}
                                    disabled={isVerifying || !apiKey}
                                    className="mt-4 w-full py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-70 transition-colors flex justify-center items-center gap-2"
                                >
                                    {isVerifying ? 'Verifying...' : 'Save & Verify Connection'}
                                </button>
                                
                                <div className="mt-auto pt-6 text-xs text-center text-gray-500">
                                    Don't have a key? Get one for free at <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">console.groq.com</a>
                                </div>
                            </div>
                        ) : (
                            // Chat View
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black/20">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex gap-3 max-w-[85%]",
                                                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                            )}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                                                msg.role === 'user' ? "bg-blue-600 text-white" : "bg-purple-600 text-white"
                                            )}>
                                                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                            </div>
                                            <div className={cn(
                                                "p-3 rounded-2xl text-sm shadow-sm",
                                                msg.role === 'user'
                                                    ? "bg-blue-600 text-white rounded-br-none"
                                                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700 whitespace-pre-wrap"
                                            )}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="flex gap-3 max-w-[85%]">
                                            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                                                <Bot size={14} />
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700">
                                                <div className="flex gap-1">
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-white dark:bg-card border-t border-gray-200 dark:border-gray-700">
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                        className="flex gap-2"
                                    >
                                        <input
                                            type="text"
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            placeholder="Ask AI..."
                                            className="flex-1 bg-gray-100 dark:bg-gray-800 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!inputText.trim() || isTyping}
                                            className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 shadow-md"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    "fixed bottom-6 right-6 p-4 rounded-full shadow-lg z-50 transition-all duration-300",
                    isOpen
                        ? "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rotate-90"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-purple-500/25"
                )}
            >
                {isOpen ? <X size={24} /> : <Sparkles size={24} />}
            </motion.button>
        </>
    );
}
