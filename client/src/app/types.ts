export interface Writer {
    writerId: number
    writerName: string
}

export interface UploadTextPayload {
    content: string
    title?: string
    author?: string
}

export interface Text {
    textId: number
    title: string
    content: string
    author?: string
    createdAt: string
}

export interface ProcessingWritersResponse {
    writerIds: number[]
}

export interface ConversationResponse {
    text: string
    sentenceIndex: number
    distance: number
    writer: number
    best: {
        text: string
        writer: number
    }
}

export interface ConversationStartResponse {
    conversationId: number
}

export interface ConversationDetailsResponse {
    conversationId: number
    writers: Writer[]
}

export interface ConversationMessage {
    messageId: number
    conversationId: number
    sender: "user" | "system"
    text: string
    writerId?: number
    seqId: number
}

// The API returns messages directly as an array, not wrapped in an object
export type ConversationMessagesResponse = ConversationMessage[]
