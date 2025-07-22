import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSpinner, FaCheckCircle } from 'react-icons/fa';
import Conversation from '../components/Conversation';
import { checkConversationExists, getWritersByConversation } from '../services/api';
import type { Writer } from '../types';

const CARD_WIDTH = 200; // Same as in WriterCard
const CARD_HEIGHT = 150; // Same as in WriterCard
const FINAL_LEFT_OFFSET = 50; // Same as in WriterCard
const FINAL_VERTICAL_SPACING = 20; // Same as in WriterCard

const StaticWriterCard = ({ writer, index }: { writer: Writer; index: number }) => {
    const topPosition = FINAL_LEFT_OFFSET + index * (CARD_HEIGHT + FINAL_VERTICAL_SPACING);

    return (
        <div
            className="absolute"
            style={{
                top: `${topPosition}px`,
                left: `${FINAL_LEFT_OFFSET}px`,
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                zIndex: 100 + index,
            }}
        >
            <div
                className="w-full h-full cursor-pointer transition-all duration-300 transform border-2 border-gray-800 bg-gray-900 text-white shadow-2xl scale-105 rounded-[3rem]"
            >
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                    <h3 className="text-xl font-medium mb-2 text-white">{writer.writerName}</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white mt-4">
                        <FaCheckCircle className="h-5 w-5 text-gray-900" />
                    </div>
                </div>
            </div>
        </div>
    );
};

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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8 overflow-hidden">
            <div className="relative flex h-full">
                {/* Left Side: Static Writer Cards */}
                <aside className="w-1/4 relative">
                    {writers.map((writer, index) => (
                        <StaticWriterCard key={writer.writerId} writer={writer} index={index} />
                    ))}
                </aside>

                {/* Right Side: Conversation Area */}
                <main className="flex-1 pl-[350px]">
                    <Conversation conversationId={parseInt(conversationId!, 10)} />
                </main>
            </div>
        </div>
    );
};

export default ConversationPage;
