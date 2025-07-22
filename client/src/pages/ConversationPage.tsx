import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import Conversation from '../components/Conversation';
import { checkConversationExists, getWritersByConversation } from '../services/api';
import type { Writer } from '../types';

const ConversationPage = () => {
    const navigate = useNavigate();
    const { conversationId } = useParams<{ conversationId: string }>();
    const [writers, setWriters] = useState<Writer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const validateAndLoad = async () => {
            if (!conversationId) {
                setError('Missing conversation ID');
                setLoading(false);
                return;
            }

            try {
                const id = parseInt(conversationId, 10);
                const [{ valid }, writersData] = await Promise.all([
                    checkConversationExists(id),
                    getWritersByConversation(id),
                ]);

                if (!valid) {
                    setError('Conversation not found');
                } else {
                    setWriters(writersData);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load conversation data');
            } finally {
                setLoading(false);
            }
        };

        validateAndLoad();
    }, [conversationId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <FaSpinner className="animate-spin text-4xl text-blue-600" />
                <p className="ml-4 text-lg text-gray-700">Loading conversation...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <p className="text-xl text-red-600">Error: {error}</p>
                <button
                    className="mt-6 bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
                    onClick={() => navigate('/')}
                >
                    Go Back to Homepage
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Left Sidebar: Writers List */}
            <aside className="w-1/4 bg-white border-r border-gray-200 p-6 shadow-md">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-sm font-semibold text-gray-600 hover:text-blue-600 transition mb-6"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to Selection
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Writers</h2>
                <div className="space-y-3">
                    {writers.map((writer) => (
                        <div key={writer.writerId} className="p-4 bg-gray-100 rounded-lg">
                            <p className="font-bold text-lg text-gray-900">{writer.writerName}</p>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Right Side: Conversation Area */}
            <main className="flex-1 flex flex-col">
                <div className="flex-grow p-6 overflow-y-auto">
                    <Conversation conversationId={parseInt(conversationId!, 10)} />
                </div>
            </main>
        </div>
    );
};

export default ConversationPage;