import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Conversation from '../components/Conversation'
import type { Writer } from '../types'
import {processWriters} from "../services/api.ts";

const ConversationPage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const writers: Writer[] = location.state?.writers || []

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!writers.length) return

        const process = async () => {
            try {
                const writerIds = writers.map(w => w.writerId)
                //TODO(): change this
                // await processWriters(writerIds)
                setLoading(false)
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'processing failed.')
                setLoading(false)
            }
        }

        process()
    }, [writers])

    if (!writers.length) {
        return (
            <div className="text-center mt-10">
                <p className="text-red-600">No writers selected. Please return to the home page.</p>
                <button
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => navigate('/')}
                >
                    Go Back
                </button>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="text-center mt-10">
                <p className="text-gray-700 mb-4">Preparing your conversation...</p>
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center mt-10">
                <p className="text-red-600">Error: {error}</p>
                <button
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => navigate('/')}
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">💬 Conversation Mode</h1>
            <p className="mb-4 text-gray-700">
                You're now talking with: {writers.map(w => w.writerName).join(', ')}
            </p>
            <Conversation writers={writers} />
        </div>
    )
}

export default ConversationPage