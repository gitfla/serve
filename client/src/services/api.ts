import axios from 'axios'
import type { UploadTextPayload, Writer } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
//const API_BASE = import.meta.env.VITE_API_BASE || 'https://serve-backend-822718896837.us-central1.run.app'

export async function uploadText(payload: UploadTextPayload) {
    return axios.post(`${API_BASE}/api/texts`, payload)
}


export const uploadTextFile = async (formData: FormData) => {
    await axios.post(`${API_BASE}/api/texts`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
}

export async function fetchWriters(): Promise<Writer[]> {
    const response = await axios.get(`${API_BASE}/api/writers`)
    return response.data
}

export async function getProcessingWriters(): Promise<Writer[]> {
    const response = await axios.get(`${API_BASE}/api/writers/processing`)
    return response.data
}

export async function fetchTexts(): Promise<Text[]> {
    const response = await axios.get(`${API_BASE}/api/texts`)
    return response.data
}

export async function processWriters(writerIds: number[])  {
    const response = await axios.post(`${API_BASE}/api/process` , {params : {writerIds}})
    return response.data
}


export async function deleteText(textId: number) {
    return axios.delete(`${API_BASE}/api/texts/${textId}`)
}

export async function deleteWriter(writerId: number) {
    return axios.delete(`${API_BASE}/api/writers/${writerId}`)
}

export async function startConversation(selectedWriters: Writer[]) {
    const writerIds = selectedWriters.map(w => w.writerId)
    const response = await axios.post(`${API_BASE}/api/conversation/start` , {writerIds})
    return response.data as {
        conversationId: number
    }
}

export async function checkConversationExists(conversationId: number): Promise<{ valid: boolean }> {
    try {
        await axios.get(`${API_BASE}/api/conversation/${conversationId}`)
        return { valid: true }
    } catch (err: any) {
        if (err.response?.status === 404) {
            return { valid: false }
        }
        throw new Error(err.response?.data?.error || 'Failed to check conversation')
    }
}

export async function sendConversationPrompt(prompt: string, conversationId: number) {
    const response = await axios.post(`${API_BASE}/api/conversation/getNext`, {
        prompt,
        conversationId
    })

    // Assuming the backend returns: { response: 'the best match' }
    return response.data as {
        text: string
        sentenceIndex: number
        distance: number
        writer: number
    }
}
