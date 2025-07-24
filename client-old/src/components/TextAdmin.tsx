import React, { useEffect, useState } from 'react'
import type { Writer, Text } from '../types'
import {fetchTexts, fetchWriters, deleteText } from "../services/api.ts";

const TextAdmin: React.FC = () => {
    const [texts, setTexts] = useState<Text[]>([])
    const [writers, setWriters] = useState<Writer[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [textsRes, writersRes] = await Promise.all([
                    fetchTexts(),
                    fetchWriters(),
                ])
                setTexts(textsRes)
                setWriters(writersRes)
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const getWriterName = (writerId: number) => {
        const writer = writers.find(w => w.writerId === writerId)
        return writer?.writerName || 'Unknown'
    }

    const handleDelete = async (textId: number, writerId: number) => {
        try {
            await deleteText(textId)

            const updatedTexts = texts.filter(t => t.textId !== textId)
            setTexts(updatedTexts)

            const writerHasOtherTexts = updatedTexts.some(t => t.textWriter === writerId)
            if (!writerHasOtherTexts) {
                setWriters(writers.filter(w => w.writerId !== writerId))
            }
        } catch (error) {
            console.error('Error deleting text:', error)
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Text Admin</h2>
            <ul className="divide-y divide-gray-200">
                {texts.map(text => (
                    <li key={text.textId} className="py-2 flex justify-between items-center">
                        <div>
                            <p className="font-medium">{text.title}</p>
                            <p className="text-sm text-gray-600">
                                Writer ID: {text.textWriter} — {getWriterName(text.textWriter)}
                            </p>
                        </div>
                        <button
                            onClick={() => handleDelete(text.textId, text.textWriter)}
                            className="text-red-600 hover:underline"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default TextAdmin