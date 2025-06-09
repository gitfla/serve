// src/services/gcsService.ts
import { Storage } from '@google-cloud/storage'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const storage = new Storage({
    keyFilename: path.join(__dirname, '../../vars/gcs-key.json'), // adjust if needed
})

const bucketName = 'serve-blobs' // replace with actual name
const bucket = storage.bucket(bucketName)

/**
 * Uploads a file buffer directly to GCS.
 * @param fileBuffer - Buffer of the uploaded file.
 * @param originalName - Original filename to use as suffix.
 * @param destinationFolder - Optional folder path within the bucket.
 * @returns The GCS blob ID (object name).
 */
export const uploadFileToGCS = async (
    fileBuffer: Buffer,
    originalName: string,
    destinationFolder: string = 'texts'
): Promise<string> => {
    const blobName = `${destinationFolder}/${uuidv4()}-${originalName}`
    const file = bucket.file(blobName)

    await file.save(fileBuffer, {
        resumable: false,
        metadata: {
            contentType: 'text/plain',
            cacheControl: 'public, max-age=31536000',
        },
    })

    return file.name // blob ID to store in DB
}

/**
 * Downloads a file (blob) from Google Cloud Storage and returns its content as a Buffer.
 * @param blobName - The full path of the blob in the bucket (e.g. "texts/uuid-filename.txt").
 * @returns A Buffer containing the blob's content.
 */
export const downloadBlob = async (blobName: string): Promise<Buffer> => {
    const file = bucket.file(blobName)
    const [contents] = await file.download()
    return contents
}

/**
 * Deletes a file (blob) from Google Cloud Storage.
 * @param blobName - The full path of the blob in the bucket (e.g. "texts/uuid-filename.txt").
 * @returns A boolean indicating whether the deletion was successful.
 */
export const deleteBlob = async (blobName: string): Promise<boolean> => {
    const file = bucket.file(blobName)
    await file.delete()
    console.log(`Deleted blob: ${blobName}`)
    return true
}