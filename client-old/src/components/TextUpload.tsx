import { useState, type DragEvent } from 'react'
import { uploadTextFile } from '../services/api'

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
        } else {
            setError('Only plain text (.txt) files are allowed.')
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="text"
                placeholder="Writer Name"
                value={writerName}
                onChange={(e) => setWriterName(e.target.value)}
                required
                className="w-full p-2 border rounded"
            />
            <input
                type="text"
                placeholder="Text Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2 border rounded"
            />
            <div
                onDragOver={(e) => {
                    e.preventDefault()
                    setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleFileDrop}
                className={`w-full p-6 border-2 rounded ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                } text-center`}
            >
                {file ? (
                    <p>File selected: {file.name}</p>
                ) : (
                    <p>Drag and drop your .txt file here or use the file picker below</p>
                )}
            </div>
            <input
                type="file"
                accept=".txt"
                onChange={(e) => {
                    const selected = e.target.files?.[0]
                    if (selected && selected.type === 'text/plain') {
                        setFile(selected)
                        setError(null)
                    } else {
                        setError('Only .txt files are accepted.')
                    }
                }}
                className="w-full p-2 border rounded"
            />
            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                {loading ? 'Uploading...' : 'Upload'}
            </button>
            {success && <p className="text-green-600">{success}</p>}
            {error && <p className="text-red-600">{error}</p>}
        </form>
    )
}

export default TextUpload