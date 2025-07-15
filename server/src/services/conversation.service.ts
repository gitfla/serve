import {findInternalBestMatchForPrompt} from "./embed.service";
const db = require('../db/database');

export const startConversation = async (writerIds: number[]): Promise<number> => {
    // Create the conversation
    const [conversation] = await db
        .insertInto('conversations')
        .values({ timestamp: new Date() })
        .returning('conversation_id')
        .execute()

    const conversationId = conversation.conversation_id

    // Link writers to the conversation
    console.log('Now calling conversation_writers :', conversationId)
    await db
        .insertInto('conversations_writers')
        .values(
            writerIds.map((writerId) => ({
                conversation_id: conversationId,
                writer_id: writerId,
            }))
        )
        .execute()

    return conversationId
}

export const checkConversationExists = async (conversationId: number): Promise<boolean> => {
    const [conversation] = await db
        .selectFrom('conversations')
        .select('conversation_id')
        .where('conversation_id', '=', conversationId)
        .execute()

    return !!conversation
}

export const getWritersByConversation = async (
    conversationId: number
): Promise<number[]> => {
    const rows = await db
        .selectFrom('conversations_writers')
        .select('writer_id')
        .where('conversation_id', '=', conversationId)
        .execute()

    return rows.map(row => row.writer_id)
}

export const findBestMatchForPrompt = async (prompt: string, conversationId: number) => {
    const writerIds = await getWritersByConversation(conversationId)
    return findInternalBestMatchForPrompt(prompt, writerIds, conversationId)
}