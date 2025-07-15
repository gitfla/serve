import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Conversation from '../components/Conversation'
import {checkConversationExists} from "../services/api.ts";

const ConversationPage = () => {
    const navigate = useNavigate()
    const { conversationId } = useParams<{ conversationId: string }>()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const validateConversation = async () => {
            if (!conversationId) {
                setError('Missing conversation ID')
                setLoading(false)
                return
            }

            try {
                const { valid } = await checkConversationExists(parseInt(conversationId, 10))
                if (!valid) {
                    setError('Conversation not found')
                }
                setLoading(false)
            } catch (err: any) {
                setError(err.message || 'Failed to load conversation')
                setLoading(false)
            }
        }

        validateConversation()
    }, [conversationId])

    if (loading) {
        return (
            <div className="text-center mt-10">
                <p className="text-gray-700 mb-4">Loading conversation...</p>
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
                    Go Back
                </button>
            </div>
        )
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">💬 Conversation</h1>
            <Conversation conversationId={parseInt(conversationId!, 10)} />
        </div>
    )
}

export default ConversationPage