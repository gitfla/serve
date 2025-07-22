import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaCheckCircle } from 'react-icons/fa';
import type { Writer } from '../types';
import { fetchWriters, getProcessingWriters, startConversation } from '../services/api';

export default function HomePage() {
    const [writers, setWriters] = useState<Writer[]>([]);
    const [selectedWriters, setSelectedWriters] = useState<Writer[]>([]);
    const [processingWriterIds, setProcessingWriterIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [writersData, processingData] = await Promise.all([
                    fetchWriters(),
                    getProcessingWriters(),
                ]);
                setWriters(writersData);
                setProcessingWriterIds(processingData.writerIds);
            } catch (err: any) {
                setError('Failed to load writers. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const toggleWriterSelection = (writer: Writer) => {
        const isSelected = selectedWriters.some((w) => w.writerId === writer.writerId);
        if (isSelected) {
            setSelectedWriters(selectedWriters.filter((w) => w.writerId !== writer.writerId));
        } else if (selectedWriters.length < 3) {
            setSelectedWriters([...selectedWriters, writer]);
        }
    };

    const handleStartConversation = async () => {
        if (selectedWriters.length === 0) return;
        try {
            const { conversationId } = await startConversation(selectedWriters);
            navigate(`/conversation/${conversationId}`);
        } catch (err) {
            setError('Failed to start conversation. Please try again.');
        }
    };

    const isProcessing = (writerId: number) => processingWriterIds.includes(writerId);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Select Your Writers</h1>
                    <p className="text-lg text-gray-600 mt-2">
                        Choose 1-3 writers to start a conversation.
                    </p>
                </div>

                {loading && (
                    <div className="flex justify-center items-center">
                        <FaSpinner className="animate-spin text-4xl text-blue-500" />
                    </div>
                )}

                {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}

                {!loading && !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {writers.map((writer) => {
                            const isSelected = selectedWriters.some((w) => w.writerId === writer.writerId);
                            const isDisabled = isProcessing(writer.writerId) || (selectedWriters.length >= 3 && !isSelected);

                            return (
                                <div
                                    key={writer.writerId}
                                    onClick={() => !isProcessing(writer.writerId) && toggleWriterSelection(writer)}
                                    className={`
                                        relative p-6 bg-white rounded-xl shadow-lg transition-all duration-300 ease-in-out
                                        transform hover:-translate-y-1
                                        ${isProcessing(writer.writerId)
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'cursor-pointer'
                                        }
                                        ${isSelected
                                            ? 'ring-4 ring-blue-500 shadow-2xl'
                                            : 'hover:shadow-xl'
                                        }
                                        ${isDisabled && !isSelected && !isProcessing(writer.writerId) ? 'opacity-60' : ''}
                                    `}
                                >
                                    {isProcessing(writer.writerId) && (
                                        <FaSpinner className="absolute top-4 right-4 text-gray-400 animate-spin" />
                                    )}
                                    {isSelected && (
                                        <FaCheckCircle className="absolute top-4 right-4 text-2xl text-blue-500" />
                                    )}
                                    <h2 className="text-2xl font-bold mb-2 truncate">{writer.writerName}</h2>
                                    <p className="text-gray-500">
                                        {isProcessing(writer.writerId) ? 'Processing...' : 'Ready to chat'}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {selectedWriters.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
                    <div className="container mx-auto flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-lg">
                                {selectedWriters.length} writer{selectedWriters.length > 1 && 's'} selected
                            </p>
                            <p className="text-sm text-gray-600 max-w-md truncate">
                                {selectedWriters.map(w => w.writerName).join(', ')}
                            </p>
                        </div>
                        <button
                            onClick={handleStartConversation}
                            className="bg-blue-600 text-white font-bold px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                        >
                            Start Conversation
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}