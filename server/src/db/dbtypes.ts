export interface DB {
    writers: {
        writer_id: number;
        writer_name: string;
    };

    texts: {
        text_id: number;
        title: string;
        text_writer: number;
        blob_id: string;
    };

    conversations: {
        conversation_id: number;
        timestamp: Date;
    };

    conversations_sentences: {
        conversation_sentence_id: number;
        conversation: number;
        sentence_id: number;
    };

    conversations_writers: {
        conversation_writer_id: number;
        conversation_id: number;
        writer_id: number;
    };

    conversations_messages: {
        message_id: number;
        conversation_id: number;
        sender: "user" | "system";
        sentence_id: number | null;
        text: string | null;
        created_at: Date;
    };

    sentences: {
        sentence_id: number;
        text: string;
        text_id: number;
        sentence_index: number;
    };

    sentence_embeddings: {
        embedding_id: number;
        sentence_id: number;
        embedding: number[]; // assuming Postgres 'vector' is mapped to number[]
        created_at: Date;
        writer_id: number;
    };

    processing_jobs: {
        job_id: string;
        text_id: number;
        status: string; // consider narrowing to union type e.g. 'pending' | 'processing' | ...
        sentence_count: number;
        created_at: Date;
        updated_at: Date;
        error: string | null;
        started_at: Date | null;
        completed_at: Date | null;
    };
}
