"use client"
import { useState, useEffect, useRef } from "react"
import { sendConversationPrompt } from "../app/services/api"
import type { Writer, ConversationMessage } from "../app/types"

type ConversationProps = {
    conversationId: number
    initialWriters: Writer[]
    initialMessages?: ConversationMessage[] // New prop for existing messages
    onWriterSpoke?: (writerId: number) => void // Callback to notify parent of speaking writer
}

type Message = {
    sender: "user" | "system"
    text: string
    writer: string
    writerId?: number
}

export function Conversation({
                                 conversationId,
                                 initialWriters,
                                 initialMessages = [],
                                 onWriterSpoke,
                             }: ConversationProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, loading])

    // Initialize messages from conversation history
    useEffect(() => {
        if (initialMessages && initialMessages.length > 0) {
            console.log("Processing initial messages:", initialMessages)
            try {
                const formattedMessages: Message[] = initialMessages.map((msg) => ({
                    sender: msg.sender,
                    text: msg.text,
                    writer: msg.sender === "system" ? getWriterName(msg.writerId || 0) : "",
                    writerId: msg.writerId,
                }))
                setMessages(formattedMessages)

                // Set the last speaking writer if there are system messages
                const lastSystemMessage = initialMessages.filter((msg) => msg.sender === "system" && msg.writerId).pop()
                if (lastSystemMessage && lastSystemMessage.writerId && onWriterSpoke) {
                    onWriterSpoke(lastSystemMessage.writerId)
                }
            } catch (err) {
                console.error("Error processing initial messages:", err)
            }
        }
    }, [initialMessages, onWriterSpoke])

    const getWriterName = (writerId: number): string => {
        if (!writerId) return "Unknown Writer"
        const writer = initialWriters.find((w) => w.writerId === writerId)
        return writer?.writerName ?? `Writer ${writerId}`
    }

    const handleSendPrompt = async (prompt: string) => {
        setLoading(true)
        try {
            const res = await sendConversationPrompt(prompt, conversationId)

            // Extract writer ID from the response - it's in the best object
            const writerId = res.best?.writer || res.writer
            const responseText = res.best?.text || res.text || "No relevant answer found."

            // Notify parent component about which writer spoke
            if (writerId && onWriterSpoke) {
                onWriterSpoke(writerId)
            }

            const systemMessage: Message = {
                sender: "system",
                text: responseText,
                writer: getWriterName(writerId),
                writerId: writerId,
            }
            setMessages((prev) => [...prev, systemMessage])
        } catch (err: any) {
            const errorMessage: Message = {
                sender: "system",
                text: "❌ Failed to generate response. Please try again.",
                writer: "System Error",
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    const handleSend = () => {
        if (!input.trim()) return
        const userMessage: Message = { sender: "user", text: input, writer: "" }
        setMessages((prev) => [...prev, userMessage])
        handleSendPrompt(input)
        setInput("")
    }

    const handleNext = () => {
        if (loading) return
        handleSendPrompt("")
    }

    return (
        <div className="flex flex-col h-full md:bg-transparent bg-white/80 md:backdrop-blur-none backdrop-blur-sm md:rounded-none rounded-2xl overflow-hidden">
            {/* Chat History */}
            <div className="flex-grow md:p-6 p-4 md:space-y-6 space-y-4 overflow-y-auto bg-transparent">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex items-start md:gap-4 gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`md:max-w-xl max-w-[85%] md:px-5 px-4 md:py-3 py-2 rounded-2xl shadow-sm ${
                                msg.sender === "user"
                                    ? "bg-gray-800 text-white"
                                    : "bg-white text-gray-800 border border-gray-100 shadow-md"
                            }`}
                        >
                            <p className="whitespace-pre-wrap md:text-base text-sm">{msg.text}</p>
                            {msg.sender === "system" && (
                                <p className="text-xs font-semibold md:mt-2 mt-1 opacity-70">— {msg.writer}</p>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-start md:gap-4 gap-3 justify-start">
                        <div className="md:px-5 px-4 md:py-3 py-2 rounded-2xl bg-gray-100 text-gray-800 shadow-sm border border-gray-200">
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

            {/* Conversation Ready Text */}
            {messages.length === 0 && !loading && (
                <div className="text-center text-gray-500 md:px-6 px-4 md:pb-4 pb-3">
                    <h2 className="md:text-2xl text-lg font-semibold">Let's chat!</h2>
                    <p className="md:mt-2 mt-1 md:text-base text-sm">Say something or click 'Listen' to get started.</p>
                </div>
            )}

            {/* Input Area */}
            <div className="bg-transparent md:p-4 p-3">
                <div className="flex items-center md:gap-4 gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !loading) handleSend()
                        }}
                        className="flex-1 w-full px-4 py-3 text-gray-800 bg-white border border-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500 transition shadow-sm md:text-base text-sm"
                        placeholder="Say something..."
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        className="md:px-5 px-4 py-3 bg-gray-600 text-white rounded-full shadow-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 md:text-base text-sm font-medium"
                        disabled={loading || !input.trim()}
                    >
                        Talk
                    </button>
                    <button
                        onClick={handleNext}
                        className="md:px-5 px-4 py-3 bg-gray-500 text-white rounded-full shadow-md hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 md:text-base text-sm font-medium"
                        disabled={loading}
                    >
                        Listen
                    </button>
                </div>
            </div>
        </div>
    )
}
