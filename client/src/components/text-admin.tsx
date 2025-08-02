"use client"

import React, { useEffect, useState } from 'react'
import type { Writer, Text } from '../types'
import { fetchTexts, fetchWriters, deleteText } from "../app/services/api"
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Button } from './ui/button'
import { FaSpinner, FaTrash } from 'react-icons/fa'

const TextAdmin: React.FC = () => {
    const [texts, setTexts] = useState<Text[]>([])
    const [writers, setWriters] = useState<Writer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        try {
            const [textsRes, writersRes] = await Promise.all([
                fetchTexts(),
                fetchWriters(),
            ])
            setTexts(textsRes)
            setWriters(writersRes)
        } catch (err: any) {
            setError(err.message || 'Error fetching data.')
            console.error('Error fetching data:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const getWriterName = (writerId: number) => {
        const writer = writers.find(w => w.writerId === writerId)
        return writer?.writerName || 'Unknown'
    }

    const handleDelete = async (textId: number, writerId: number) => {
        if (window.confirm('Are you sure you want to delete this text?')) {
            try {
                await deleteText(textId)

                const updatedTexts = texts.filter(t => t.textId !== textId)
                setTexts(updatedTexts)

                // Check if the writer has any other texts
                const writerHasOtherTexts = updatedTexts.some(t => t.textWriter === writerId)
                if (!writerHasOtherTexts) {
                    // If not, remove the writer from the list
                    setWriters(writers.filter(w => w.writerId !== writerId))
                }
                setError(null) // Clear any previous errors
            } catch (err: any) {
                setError(err.message || 'Error deleting text.')
                console.error('Error deleting text:', err)
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <FaSpinner className="animate-spin text-4xl text-gray-500" />
                <p className="ml-4 text-gray-700">Loading texts...</p>
            </div>
        )
    }

    if (error) {
        return <p className="text-red-500 text-center">Error: {error}</p>
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Manage Texts</CardTitle>
            </CardHeader>
            <CardContent>
                {texts.length === 0 ? (
                    <p className="text-center text-gray-500">No texts uploaded yet.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Writer</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {texts.map(text => (
                                <TableRow key={text.textId}>
                                    <TableCell className="font-medium">{text.title}</TableCell>
                                    <TableCell>{getWriterName(text.textWriter)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(text.textId, text.textWriter)}
                                        >
                                            <FaTrash className="mr-2" /> Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}

export default TextAdmin
