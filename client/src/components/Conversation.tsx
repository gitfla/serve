import { useState } from 'react'
import type { Writer } from '../types'
import axios from 'axios'
import {sendConversationPrompt} from "../services/api.ts";

type ConversationProps = {
    conversationId: number
}

type Message = {
    sender: 'user' | 'system'
    text: string
    writer: string
}

export const getWriterName = (writers: Writer[], writerId: number): string => {
    console.log(writers)
    console.log(writerId)
    const writer = writers.find(w => w.writerId === writerId)
    return writer ? writer.writerName : 'Unknown Writer'
}

const Conversation: React.FC<ConversationProps> = ({ conversationId }) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSendPrompt = async (prompt: string) => {
        setLoading(true)

        try {
            console.log("sending conversationID: ", conversationId)
            const res = await sendConversationPrompt(
                prompt,
                conversationId
            )
            console.log(res)
            const systemMessage: Message = {
                sender: 'system',
                text: res.best.text || 'No relevant answer found.',
                writer: res.best.writer
            }
            setMessages(prev => [...prev, systemMessage])
        } catch (err: any) {
            console.error('❌ API call to /api/conversation failed:', err)
            const errorMessage: Message = {
                sender: 'system',
                text: '❌ Failed to generate response.',
                writer: 'System'
            }
            setMessages(prev => [...prev, errorMessage])
        }

        setLoading(false)
    }

    const handleSend = () => {
        if (!input.trim()) return
        const userMessage: Message = { sender: 'user', text: input, writer: '' }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        handleSendPrompt(input)
    }

    const handleNext = () => {
        handleSendPrompt("")
    }

    return (
        <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
                {messages.map((msg, i) => (
                    <div key={i} className={`mb-10 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        <span
                            className={`inline-block px-4 py-2 rounded ${
                                msg.sender === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-300 text-black'
                            }`}
                        >
                            {msg.text}
                            {msg.sender === 'system' && ` -- ${msg.writer}`}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') handleSend()
                    }}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="Ask something..."
                    disabled={loading}
                />
                <button
                    onClick={handleSend}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    disabled={loading}
                >
                    Send
                </button>
                {messages.some(m => m.sender === 'system') && (
                    <button
                        onClick={handleNext}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                        disabled={loading}
                    >
                        Next
                    </button>
                )}
            </div>

        </div>
    )
}

export default Conversation