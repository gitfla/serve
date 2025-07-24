import { embedPrompt } from "./cohere.service"
import { sql } from "kysely"
import { NextWriter } from "../../../shared/nextWriter"
const db = require("../db/database")

// Create a conversation and link writers
export const startConversation = async (writerIds: number[]): Promise<number> => {
    const [conversation] = await db
        .insertInto("conversations")
        .values({ timestamp: new Date() })
        .returning("conversation_id")
        .execute()

    const conversationId = conversation.conversation_id

    await db
        .insertInto("conversations_writers")
        .values(writerIds.map(writerId => ({
            conversation_id: conversationId,
            writer_id: writerId,
        })))
        .execute()

    return conversationId
}

// Check if conversation exists
export const checkConversationExists = async (conversationId: number): Promise<boolean> => {
    const result = await db
        .selectFrom("conversations")
        .select("conversation_id")
        .where("conversation_id", "=", conversationId)
        .executeTakeFirst()

    return !!result
}

// Get all writers linked to a conversation
export const getWritersByConversation = async (conversationId: number) => {
    return await db
        .selectFrom("conversations_writers as cw")
        .innerJoin("writers as w", "cw.writer_id", "w.writer_id")
        .select(["w.writer_id as writerId", "w.writer_name as writerName"])
        .where("cw.conversation_id", "=", conversationId)
        .execute()
}

// Conversation details
export const getConversationDetails = async (conversationId: number) => {
    const writers = await getWritersByConversation(conversationId)
    return { conversationId, writers }
}

// Get messages (user + system)
export const getConversationMessages = async (conversationId: number) => {
    const rows = await db
        .selectFrom("conversations_messages as cm")
        .leftJoin("sentences as s", "cm.sentence_id", "s.sentence_id")
        .leftJoin("texts as t", "s.text_id", "t.text_id")
        .leftJoin("writers as w", "t.text_writer", "w.writer_id")
        .select([
            "cm.message_id as messageId",
            "cm.conversation_id as conversationId",
            "cm.sender",
            "cm.text as userText",
            "s.text as sentenceText",
            "t.text_writer as writerId"
        ])
        .where("cm.conversation_id", "=", conversationId)
        .orderBy("cm.message_id", "asc")
        .execute()

    return rows.map(row => ({
        messageId: row.messageId,
        conversationId: row.conversationId,
        sender: row.sender,
        text: row.sender === "user" ? row.userText : row.sentenceText,
        writerId: row.sender === "system" ? row.writerId : undefined,
        seqId: row.messageId
    }))
}

export const getLastSentence = async (conversationId: number): Promise<string> => {
    const row = await db
        .selectFrom("conversations_messages as cm")
        .leftJoin("sentences as s", "cm.sentence_id", "s.sentence_id")
        .select(["cm.text", "s.text as sentenceText"])
        .where("cm.conversation_id", "=", conversationId)
        .orderBy("cm.message_id", "desc")
        .limit(1)
        .executeTakeFirst()

    if (!row) throw new Error("No previous message found.")

    return row.text ?? row.sentenceText
}

// Search for best matching sentence
export const getBestMatches = async (conversationId: number, vector: number[]) => {
    const writers = await getWritersByConversation(conversationId)
    const writerIds = writers.map(w => w.writerId)
    const rawVector = sql.raw(`'[${vector.join(",")}]'::vector`)

    const query = sql`
        SELECT s.sentence_id, s.text, s.sentence_index, se.writer_id,
               se.embedding <#> ${rawVector} AS distance
        FROM sentence_embeddings se
                 JOIN sentences s ON s.sentence_id = se.sentence_id
        WHERE se.writer_id IN (${sql.join(writerIds, sql.raw(", "))})
          AND s.sentence_id NOT IN (
            SELECT sentence_id FROM conversations_messages
            WHERE conversation_id = ${conversationId}
              AND sentence_id IS NOT NULL
        )
        ORDER BY distance ASC
            LIMIT 5
    `

    const results = await query.execute(db)
    if (!results.rows.length) throw new Error("No matching sentences found.")

    console.log("🔍 Top 5 most similar sentences:")
    results.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. [score=${row.distance.toFixed(4)}] "${row.text}"`)
    })

    return results
}

export const findBestMatchForPrompt = async (
    prompt: string,
    conversationId: number,
    nextWriter: NextWriter
) => {
    const finalPrompt = await resolveFinalPrompt(prompt, conversationId)

    if (!finalPrompt) {
        console.log("Responding with random sentence.")
        return await respondWithRandomSentence(conversationId)
    }

    if (prompt.trim()) {
        await saveUserMessage(conversationId, finalPrompt)
    }

    console.log("🧠 Getting embedding for prompt:", finalPrompt)

    const best = await getBestSemanticMatch(conversationId, finalPrompt)

    await saveSystemMessage(conversationId, best.sentence_id)

    return {
        sentenceId: best.sentence_id,
        text: best.text,
        sentenceIndex: best.sentence_index,
        distance: best.distance,
        writer: best.writer_id,
    }
}

const resolveFinalPrompt = async (prompt: string, conversationId: number): Promise<string | null> => {
    const trimmed = prompt.trim()
    if (trimmed) return trimmed

    try {
        return await getLastSentence(conversationId)
    } catch {
        return null
    }
}

const saveUserMessage = async (conversationId: number, text: string) => {
    await db.insertInto("conversations_messages").values({
        conversation_id: conversationId,
        sender: "user",
        text,
    }).execute()
}

const saveSystemMessage = async (conversationId: number, sentenceId: number) => {
    await db.insertInto("conversations_messages").values({
        conversation_id: conversationId,
        sender: "system",
        sentence_id: sentenceId,
    }).execute()
}

const getBestSemanticMatch = async (conversationId: number, prompt: string) => {
    const vector = await embedPrompt(prompt)
    const results = await getBestMatches(conversationId, vector)

    if (!results.rows.length) {
        throw new Error("No matching sentences found.")
    }

    // Log top 5 (optional)
    console.log("🔍 Top 5 most similar sentences:")
    results.rows.forEach((row, i) =>
        console.log(`   ${i + 1}. [score=${row.distance.toFixed(4)}] "${row.text}"`)
    )

    return results.rows[0]
}

const respondWithRandomSentence = async (conversationId: number) => {
    const writerIds = (await getWritersByConversation(conversationId)).map(w => w.writerId)

    const random = await db
        .selectFrom("sentences as s")
        .innerJoin("texts as t", "s.text_id", "t.text_id")
        .where("t.text_writer", "in", writerIds)
        .select([
            "s.sentence_id",
            "s.text",
            "s.sentence_index",
            "t.text_writer as writer_id",
        ])
        .orderBy(sql`RANDOM()`)
        .limit(1)
        .executeTakeFirst()

    if (!random) throw new Error("No sentence found for fallback.")

    await saveSystemMessage(conversationId, random.sentence_id)

    return {
        sentenceId: random.sentence_id,
        text: random.text,
        sentenceIndex: random.sentence_index,
        distance: undefined,
        writer: random.writer_id,
    }
}