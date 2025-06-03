export interface Writers {
    writer_id: number;
    writer_name: string;
}

export interface Texts {
    text_id: number;
    title: string;
    text_writer: number;
    blob_id: number;
}

export interface Sentences {
    sentence_id: number;
    text: string;
    text_id: number;
}

export interface Conversations {
    conversation_id: number;
    timestamp: Date;
}

export interface ConversationsSentences {
    conversation_sentence_id: number;
    conversation: number;
    sentence_id: number;
}

export interface ConversationsWriters {
    conversation_writer_id: number;
    conversation_id: number;
    writer_id: number;
}

export interface DB {
    writers: Writers;
    texts: Texts;
    sentences: Sentences;
    conversations: Conversations;
    conversations_sentences: ConversationsSentences;
    conversations_writers: ConversationsWriters;
}
