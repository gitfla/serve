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
