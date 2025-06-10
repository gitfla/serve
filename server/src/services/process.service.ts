// services/processingService.ts
import {getBlobIdsForWriter, getText} from './text.service'
import { downloadBlob } from './gcs.service'

export async function handleProcessJob(jobId: number) {
    console.log('processing started for job:', jobId)
    const text = await getText(jobId)

    const contentBuffer = await downloadBlob(text.blobId)
    const content = contentBuffer.toString().trim()
    const sentences = content.split(/(?<=[.?!])\s+/)

        // Simulate processing time or complexity
    console.log(`processing book ${text.textId}, ${sentences.length} sentences`)

        //await saveprocessingResult(writerId, book.id, sentences)

    console.log('processing ended for job:', jobId);
}

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
}