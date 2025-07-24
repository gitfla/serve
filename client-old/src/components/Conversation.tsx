import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaSync } from 'react-icons/fa';
import { sendConversationPrompt } from '../services/api.ts';

type ConversationProps = {
    conversationId: number;
};

type Message = {
    sender: 'user' | 'system';
    text: string;
    writer: string;
};

const Conversation: React.FC<ConversationProps> = ({ conversationId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSendPrompt = async (prompt: string) => {
        setLoading(true);
        try {
            const res = await sendConversationPrompt(prompt, conversationId);
            const systemMessage: Message = {
                sender: 'system',
                text: res.best.text || 'No relevant answer found.',
                writer: res.best.writer,
            };
            setMessages((prev) => [...prev, systemMessage]);
        } catch (err: any) {
            const errorMessage: Message = {
                sender: 'system',
                text: '❌ Failed to generate response. Please try again.',
                writer: 'System Error',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = () => {
        if (!input.trim()) return;
        const userMessage: Message = { sender: 'user', text: input, writer: '' };
        setMessages((prev) => [...prev, userMessage]);
        handleSendPrompt(input);
        setInput('');
    };

    const handleNext = () => {
        if (loading) return;
        // Use a specific prompt for "Next" or an empty one if the backend handles it
        handleSendPrompt('');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat History */}
            <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                {messages.length === 0 && !loading && (
                    <div className="text-center text-gray-500">
                        <h2 className="text-2xl font-semibold">Conversation Ready</h2>
                        <p className="mt-2">Ask a question or click 'Next' to get the first insight.</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-xl px-5 py-3 rounded-2xl shadow-sm ${msg.sender === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-800'
                                }`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            {msg.sender === 'system' && (
                                <p className="text-xs font-semibold mt-2 opacity-80">-- {msg.writer}</p>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-start gap-4 justify-start">
                        <div className="px-5 py-3 rounded-2xl bg-white text-gray-800 shadow-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !loading) handleSend();
                        }}
                        className="flex-1 w-full px-4 py-3 text-gray-800 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        placeholder="Ask a follow-up question..."
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        className="px-5 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                        disabled={loading || !input.trim()}
                    >
                        <FaPaperPlane />
                    </button>
                    <button
                        onClick={handleNext}
                        className="px-5 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                        disabled={loading}
                    >
                        <FaSync />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Conversation;
