import axios from "axios"
import type {
    UploadTextPayload,
    Writer,
    Text,
    ProcessingWritersResponse,
    ConversationStartResponse,
    ConversationResponse,
    ConversationDetailsResponse,
    ConversationMessagesResponse,
} from "../types"

const API_BASE =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080'
        : process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export async function uploadText(payload: UploadTextPayload) {
    return axios.post(`${API_BASE}/api/texts`, payload)
}

export const uploadTextFile = async (formData: FormData) => {
    await axios.post(`${API_BASE}/api/texts`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
}

export async function fetchWriters(): Promise<Writer[]> {
    const response = await axios.get(`${API_BASE}/api/writers`)
    return response.data
}

export async function getProcessingWriters(): Promise<ProcessingWritersResponse> {
    const response = await axios.get(`${API_BASE}/api/writers/processing`)
    return response.data
}

export async function fetchTexts(): Promise<Text[]> {
    const response = await axios.get(`${API_BASE}/api/texts`)
    return response.data
}

export async function processWriters(writerIds: number[]) {
    const response = await axios.post(`${API_BASE}/api/process`, { params: { writerIds } })
    return response.data
}

export async function deleteText(textId: number) {
    return axios.delete(`${API_BASE}/api/texts/${textId}`)
}

export async function deleteWriter(writerId: number) {
    return axios.delete(`${API_BASE}/api/writers/${writerId}`)
}

export async function startConversation(selectedWriters: Writer[]): Promise<ConversationStartResponse> {
    const writerIds = selectedWriters.map((w) => w.writerId)
    const response = await axios.post(`${API_BASE}/api/conversation/start`, { writerIds })
    return response.data
}

export async function checkConversationExists(conversationId: number): Promise<{ valid: boolean }> {
    try {
        const response = await axios.get(`${API_BASE}/api/conversation/${conversationId}`)
        return { valid: true }
    } catch (err: any) {
        if (err.response?.status === 404) {
            return { valid: false }
        }
        throw new Error(err.response?.data?.error || "Failed to check conversation")
    }
}

// Get conversation details including writers
export async function getConversationDetails(conversationId: number): Promise<ConversationDetailsResponse> {
    try {
        const response = await axios.get(`${API_BASE}/api/conversation/${conversationId}/details`)
        console.log("Conversation details response:", response.data)
        return response.data
    } catch (error: any) {
        console.error("Error fetching conversation details:", error)
        throw error
    }
}

// Get all messages/sentences for a conversation - API returns array directly
export async function getConversationMessages(conversationId: number): Promise<ConversationMessagesResponse> {
    try {
        const response = await axios.get(`${API_BASE}/api/conversation/${conversationId}/messages`)
        console.log("Conversation messages response:", response.data)
        // API returns the messages array directly, not wrapped in an object
        return response.data
    } catch (error: any) {
        console.error("Error fetching conversation messages:", error)
        throw error
    }
}

export async function sendConversationPrompt(prompt: string, conversationId: number): Promise<ConversationResponse> {
    const response = await axios.post(`${API_BASE}/api/conversation/getNext`, {
        prompt,
        conversationId,
    })
    return response.data
}
