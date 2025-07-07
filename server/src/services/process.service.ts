// services/processingService.ts
import {getBlobIdsForWriter, getText} from './text.service'
import { downloadBlob } from './gcs.service'
import {embedText, getLastProcessedSentenceIndex} from "./embed.service";
import {enqueueTextProcessingTask} from "./task.service";

const db = require('../db/database');

export async function handleProcessJob(textId: number) {
    console.log('processing started for job:', textId)
    console.log(`📦 Memory usage before processing: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`)
    await markJobStarted(textId)
    try {
        const text = await getText(textId)
        const contentBuffer = await downloadBlob(text.blobId)
        const content = contentBuffer.toString().trim()

        const lastProcessed = await getLastProcessedSentenceIndex(text.textId)
        const resumeFrom = lastProcessed + 1
        console.log(`Calling embedText: lastProcessed ${lastProcessed}, resumeFrom: ${resumeFrom}`)
        const { totalSentences } = await embedText(content, text.textWriter, text.textId, resumeFrom)

        console.log(`📦 Memory usage after embedding: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`)
        console.log(`✅ Finished embedding ${totalSentences} sentences for text ${textId}`)

        await markJobCompleted(textId, totalSentences)
    } catch (err: any) {
        if (err?.statusCode === 429 || err?.body?.message?.includes('rate limit')) {
            console.warn(`⏸ Rate limit hit for text ${textId}. Marking job as paused.`)
            await markJobPaused(textId)
            await enqueueTextProcessingTask(textId, 90);
            return
        }
        console.error(`❌ Error processing text ${textId}:`, err)
        await markJobFailed(textId, err.message || 'Unknown error')
    }

    console.log(`📦 Memory usage at end of text ${textId}: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`)
    console.log('processing ended for text:', textId)
}

export const createProcessingJob = async (textId: number) => {
    await db
        .insertInto('processing_jobs')
        .values({
            text_id: textId,
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date(),
        })
        .execute();

    console.log(`🆕 Created processing job for text ${textId}`);
};

export const markJobStarted = async (textId: number) => {
    await db
        .updateTable('processing_jobs')
        .set({
            started_at: new Date(),
            status: 'processing',
        })
        .where('text_id', '=', textId)
        .execute()
}

export const markJobCompleted = async (textId: number, sentenceCount: number) => {
    await db
        .updateTable('processing_jobs')
        .set({
            completed_at: new Date(),
            status: 'completed',
            sentence_count: sentenceCount,
        })
        .where('text_id', '=', textId)
        .execute()
}

export const markJobFailed = async (textId: number, error: string) => {
    await db
        .updateTable('processing_jobs')
        .set({
            completed_at: new Date(),
            status: 'failed',
            error: error,
        })
        .where('text_id', '=', textId)
        .execute()
}

export const markJobPaused = async (textId: number) => {
    await db
        .updateTable('processing_jobs')
        .set({
            status: 'paused',
            updated_at: new Date(),
        })
        .where('text_id', '=', textId)
        .execute()
}
/*
export async function handleProcessWriters(writerIds: number[]) {
    console.log('processing started', writerIds)
    for (const writerId of writerIds) {
        console.log('processing started for writer', writerId)
        const blobs = await getBlobIdsForWriter(writerId)

        for (const blob of blobs) {
            const contentBuffer = await downloadBlob(blob)
            const content = contentBuffer.toString().trim()
            const sentences = content.split(/(?<=[.?!])\s+/)

            // Simulate processing time or complexity
            console.log(`processing writer ${writerId}, book ${blob}, ${sentences.length} sentences`)

            //await saveprocessingResult(writerId, book.id, sentences)
        }
        console.log('processing ended for writer', writerId)
    }


    console.log('✅ processing complete')
}*/