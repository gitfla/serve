// src/services/cohere.service.ts
import { CohereClient } from 'cohere-ai'
import Bottleneck from 'bottleneck'

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY! })

const limiter = new Bottleneck({
    reservoir: 100,
    reservoirRefreshAmount: 100,
    reservoirRefreshInterval: 60 * 1000,
    maxConcurrent: 1,
})

export const embedSentences = async (texts: string[]): Promise<number[][]> => {
    const response = await limiter.schedule(() =>
        cohere.embed({
            texts,
            model: 'embed-english-v3.0',
            inputType: 'search_document',
        })
    )
    if (!response.embeddings || !Array.isArray(response.embeddings)) {
        throw new Error('Invalid embedding response from Cohere')
    }
    return response.embeddings as number[][]
}

export const embedPrompt = async (text: string): Promise<number[]> => {
    const response = await limiter.schedule(() =>
        cohere.embed({
            texts: [text],
            model: 'embed-english-v3.0',
            inputType: 'search_query',
        })
    )
    const embedding = response.embeddings?.[0]
    if (!embedding) throw new Error('No embedding returned')
    return embedding
}
