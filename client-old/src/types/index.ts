export interface UploadTextPayload {
    title: string
    writerName: string
    fileContent: string
}

export interface Writer {
    writerId: number
    writerName: string
}

export interface Text {
    textId: number
    title: string
    textWriter: number
    blobId: string
}

export interface Sentence {
    sentenceId: number
    textId: number
    content: string
}

export interface ConversationMessage {
  messageId: number
  conversationId: number
  sender: "user" | "system"
  text: string
  writerId?: number
  seqId: number
  createdAt: string
}