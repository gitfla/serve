"use client"

import { useState, type DragEvent } from 'react'
import { uploadTextFile } from '../app/services/api'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { FaUpload, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa'

const TextUpload = () => {
    const [writerName, setWriterName] = useState('')
    const [title, setTitle] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragActive(false)
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile && droppedFile.type === 'text/plain') {
            setFile(droppedFile)
            setError(null)
        } else {
            setError('Only plain text (.txt) files are allowed.')
            setFile(null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setSuccess(null)
        setError(null)

        if (!file) {
            setError('Please upload a .txt file.')
            setLoading(false)
            return
        }

        const formData = new FormData()
        formData.append('writerName', writerName)
        formData.append('title', title)
        formData.append('file', file)

        try {
            await uploadTextFile(formData)
            setSuccess('Upload successful!')
            setWriterName('')
            setTitle('')
            setFile(null)
        } catch (err: any) {
            setError(err.message || 'Upload failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Upload New Text</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="writerName">Writer Name</Label>
                        <Input
                            id="writerName"
                            type="text"
                            placeholder="e.g., Jane Austen"
                            value={writerName}
                            onChange={(e) => setWriterName(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="title">Text Title</Label>
                        <Input
                            id="title"
                            type="text"
                            placeholder="e.g., Pride and Prejudice"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div
                        onDragOver={(e) => {
                            e.preventDefault()
                            setDragActive(true)
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleFileDrop}
                        className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg transition-all duration-200
                            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
                            ${file ? 'border-green-500 bg-green-50' : ''}
                            ${error ? 'border-red-500 bg-red-50' : ''}
                            cursor-pointer`}
                    >
                        {file ? (
                            <div className="flex items-center space-x-2 text-green-600">
                                <FaCheckCircle className="h-5 w-5" />
                                <p>File selected: {file.name}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center space-y-2 text-gray-500">
                                <FaUpload className="h-8 w-8" />
                                <p className="text-center">Drag and drop your .txt file here</p>
                                <p className="text-sm">or click to select</p>
                            </div>
                        )}
                        <Input
                            id="file-upload"
                            type="file"
                            accept=".txt"
                            onChange={(e) => {
                                const selected = e.target.files?.[0]
                                if (selected && selected.type === 'text/plain') {
                                    setFile(selected)
                                    setError(null)
                                } else {
                                    setError('Only .txt files are accepted.')
                                    setFile(null)
                                }
                            }}
                            className="hidden" // Hide the default input
                            disabled={loading}
                        />
                        <Label htmlFor="file-upload" className="mt-4 cursor-pointer text-blue-600 hover:underline">
                            {file ? 'Change File' : 'Select File'}
                        </Label>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || !file || !writerName || !title}>
                        {loading ? (
                            <><FaSpinner className="mr-2 animate-spin" /> Uploading...</>
                        ) : (
                            <><FaUpload className="mr-2" /> Upload Text</>
                        )}
                    </Button>

                    {success && (
                        <div className="flex items-center space-x-2 text-green-600">
                            <FaCheckCircle /> <p>{success}</p>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center space-x-2 text-red-600">
                            <FaTimesCircle /> <p>{error}</p>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    )
}

export default TextUpload
