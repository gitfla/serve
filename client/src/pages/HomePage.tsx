import { useEffect, useState } from 'react'
import { fetchWriters } from '../services/api'
import type { Writer } from '../types'

export default function HomePage() {
    const [writers, setWriters] = useState<Writer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchWriters()
            .then(setWriters)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-center">📝 Start a Conversation</h1>

            {loading && <p className="text-center text-gray-500">Loading writers...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {writers.map((writer) => (
                    <div key={writer.writerId} className="bg-white shadow-md p-4 rounded-lg border hover:shadow-lg transition">
                        <h2 className="text-xl font-semibold mb-2">{writer.writerName}</h2>
                        <p className="text-sm text-gray-600 mb-4">Ready to chat with this writer's texts.</p>
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                            onClick={() => alert(`Start conversation with ${writer.writerName}`)} // Replace with navigation later
                        >
                            Start Conversation
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}