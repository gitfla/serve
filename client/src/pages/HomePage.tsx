import { useEffect, useState } from 'react'
import { fetchWriters, startConversation, getProcessingWriters } from '../services/api'
import type { Writer } from '../types'
import { useNavigate } from 'react-router-dom'
import { FaSpinner } from 'react-icons/fa'

export default function HomePage() {
    const [writers, setWriters] = useState<Writer[]>([])
    const [selectedWriters, setSelectedWriters] = useState<Writer[]>([])
    const [processingWriterIds, setProcessingWriterIds] = useState<number[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const loadData = async () => {
            try {
                const [writersData, processingData] = await Promise.all([
                    fetchWriters(),
                    getProcessingWriters(),
                ])
                setWriters(writersData)
                setProcessingWriterIds(processingData.writerIds)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const toggleWriterSelection = (writer: Writer) => {
        const isSelected = selectedWriters.find(w => w.writerId === writer.writerId)
        if (isSelected) {
            setSelectedWriters(selectedWriters.filter(w => w.writerId !== writer.writerId))
        } else if (selectedWriters.length < 3) {
            setSelectedWriters([...selectedWriters, writer])
        }
    }

    const handleStartConversation = async () => {
        try {
            const { conversationId } = await startConversation(selectedWriters)
            navigate(`/conversation/${conversationId}`)
        } catch (err) {
            console.error('Error starting conversation:', err)
            alert('Failed to start conversation. Please try again.')
        }
    }

    const isProcessing = (writerId: number) => processingWriterIds.includes(writerId)

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-center">📝Start a Conversation</h1>

            {loading && <p className="text-center text-gray-500">Loading writers...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {writers.map((writer) => {
                    const isSelected = selectedWriters.some(w => w.writerId === writer.writerId)
                    const disabled = isProcessing(writer.writerId)

                    return (
                        <div
                            key={writer.writerId}
                            onClick={() => !disabled && toggleWriterSelection(writer)}
                            className={`relative cursor-pointer bg-white p-4 rounded-lg border shadow-md transition ${
                                disabled
                                    ? 'opacity-50 cursor-not-allowed'
                                    : isSelected
                                        ? 'border-blue-500 ring-2 ring-blue-300'
                                        : 'hover:shadow-lg'
                            }`}
                        >
                            <h2 className="text-xl font-semibold mb-2">{writer.writerName}</h2>
                            <p className="text-sm text-gray-600">
                                {disabled
                                    ? 'Processing...'
                                    : `Click to ${isSelected ? 'deselect' : 'select'} this writer.`}
                            </p>

                            {disabled && (
                                <div className="absolute top-2 right-2 text-blue-500 animate-spin">
                                    <FaSpinner />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="mt-6 text-center">
                {selectedWriters.length === 0 && (
                    <p className="text-red-500 mb-2">Please select at least one writer to start a conversation.</p>
                )}
                {selectedWriters.length > 0 && (
                    <button
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                        onClick={handleStartConversation}
                    >
                        Start Conversation
                    </button>
                )}
            </div>
        </div>
    )
}