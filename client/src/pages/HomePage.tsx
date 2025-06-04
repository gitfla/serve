import { useEffect, useState } from 'react'
import { fetchWriters } from '../services/api'
import type { Writer } from '../types'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
    const [writers, setWriters] = useState<Writer[]>([])
    const [selectedWriters, setSelectedWriters] = useState<Writer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchWriters()
            .then(setWriters)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const toggleWriterSelection = (writer: Writer) => {
        const isSelected = selectedWriters.find(w => w.writerId === writer.writerId)
        if (isSelected) {
            setSelectedWriters(selectedWriters.filter(w => w.writerId !== writer.writerId))
        } else if (selectedWriters.length < 3) {
            setSelectedWriters([...selectedWriters, writer])
        }
    }


    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-center">📝Start a Conversation</h1>

            {loading && <p className="text-center text-gray-500">Loading writers...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {writers.map((writer) => {
                    const isSelected = selectedWriters.some(w => w.writerId === writer.writerId)
                    return (
                        <div
                            key={writer.writerId}
                            onClick={() => toggleWriterSelection(writer)}
                            className={`cursor-pointer bg-white p-4 rounded-lg border shadow-md transition ${
                                isSelected
                                    ? 'border-blue-500 ring-2 ring-blue-300'
                                    : 'hover:shadow-lg'
                            }`}
                        >
                            <h2 className="text-xl font-semibold mb-2">{writer.writerName}</h2>
                            <p className="text-sm text-gray-600">Click to {isSelected ? 'deselect' : 'select'} this writer.</p>
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
                        onClick={() => navigate(`/conversation`, {state: {writers: selectedWriters}})
                        }
                    >
                        Start Conversation
                    </button>
                )}
            </div>
        </div>
    )
}