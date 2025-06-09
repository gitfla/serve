// services/preprocessingService.ts
import { getBlobIdsForWriter } from './text.service'
import { downloadBlob } from './gcs.service'

export async function handlePreprocessWriters(writerIds: number[]) {
    console.log('Preprocessing started', writerIds)
    for (const writerId of writerIds) {
        console.log('Preprocessing started for writer', writerId)
        const blobs = await getBlobIdsForWriter(writerId)

        for (const blob of blobs) {
            const contentBuffer = await downloadBlob(blob)
            const content = contentBuffer.toString().trim()
            const sentences = content.split(/(?<=[.?!])\s+/)

            // Simulate processing time or complexity
            console.log(`Preprocessing writer ${writerId}, book ${blob}, ${sentences.length} sentences`)

            //await savePreprocessingResult(writerId, book.id, sentences)
        }
        console.log('Preprocessing ended for writer', writerId)
    }


    console.log('✅ Preprocessing complete')
}