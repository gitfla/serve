import {embedPrompt} from "./cohere.service";
import { sql } from 'kysely'
import {NextWriter} from "../../../shared/nextWriter";
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

export const getLastSentence = async (conversationId: number) => {
    const lastSentenceRow = await db
        .selectFrom('conversations_sentences as cs')
        .innerJoin('sentences as s', 'cs.sentence_id', 's.sentence_id')
        .select(['s.text'])
        .where('cs.conversation', '=', conversationId)
        .orderBy('cs.conversation_sentence_id', 'desc')
        .limit(1)
        .executeTakeFirst()

    if (!lastSentenceRow) {
        throw new Error('No previous sentence found in conversation.')
    }

    return lastSentenceRow.text
}

export const getBestMatches = async(conversationId: number, vector: number[]) => {
    const writerIds = await getWritersByConversation(conversationId)
    const rawVector = sql.raw(`'[${vector.join(',')}]'::vector`)
    // Step 3: Search top 5 most similar sentences, excluding ones already shown
    const query = sql`
        SELECT s.sentence_id, s.text, s.sentence_index, se.writer_id,
               se.embedding <#> ${rawVector} AS distance
        FROM sentence_embeddings se
                 JOIN sentences s ON s.sentence_id = se.sentence_id
        WHERE se.writer_id IN (${sql.join(writerIds, sql.raw(', '))})
          AND s.sentence_id NOT IN (
            SELECT sentence_id FROM conversations_sentences
            WHERE conversation = ${conversationId}
        )
        ORDER BY distance ASC
            LIMIT 5
    `

    const results = await query.execute(db)
    if (!results.rows.length) {
        throw new Error('No matching sentences found.')
    }
    // Step 4: Log top 5
    console.log('🔍 Top 5 most similar sentences:')
    results.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. [score=${row.distance.toFixed(4)}] "${row.text}"`)
    })
    return results;
}

export const findBestMatchForPrompt = async (prompt: string, conversationId: number, nextWriter: NextWriter) => {
    let finalPrompt = prompt
    if (!prompt.trim()) {
        finalPrompt = await getLastSentence(conversationId)
    }

    // Step 2: Embed prompt using Cohere
    const vector = await embedPrompt(finalPrompt)

    // Step 5: Pick best result
    const bestResults = await getBestMatches(conversationId, vector)
    const best = bestResults.rows[0]

    // Step 6: Save to conversations_sentences
    await db
        .insertInto('conversations_sentences')
        .values({
            conversation: conversationId,
            sentence_id: best.sentence_id,
        })
        .execute()

    return {
        sentenceId: best.sentence_id,
        text: best.text,
        sentenceIndex: best.sentence_index,
        distance: best.distance,
        writer: best.writer_id,
    }
}