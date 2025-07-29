import {deleteBlob, uploadFileToGCS} from "./gcs.service";
import {deleteWriterIfNecessary} from "./writer.service";

const multer = require('multer')
import db from '../db/database';


const upload = multer({ storage: multer.memoryStorage() })

export const handleUploadText = async ({ writerName, title, fileBuffer, fileName }) => {
    //const { writerId, bookId } = await insertBookAndWriter(writerName, bookTitle);
    //const gcsPath = await uploadToGCS(bookId, fileContent);
    console.log("adding to db: writerName, title, fileContent", writerName, title, fileBuffer, fileName);
    // Find or create writer
    const existingWriter = await db
        .selectFrom('writers')
        .select(['writer_id'])
        .where('writer_name', '=', writerName)
        .executeTakeFirst();

    let writer_id: number;

    if (existingWriter) {
        console.log("writer already existed, id:", existingWriter.writer_id);
        writer_id = existingWriter.writer_id;
    } else {
        const newWriter = await db
            .insertInto('writers')
            .values({ writer_name: writerName })
            .returning('writer_id')
            .executeTakeFirstOrThrow();

        writer_id = newWriter.writer_id;
        console.log("writer created, id:", writer_id, "new writer: ", newWriter);
    }

    // upload to GCS and get blob_id
    const blobId = await uploadFileToGCS(fileBuffer, writerName)
    console.log("blob uploaded to bucket, blobId:", blobId);

    // Insert text
    const insertedText = await db
        .insertInto('texts')
        .values({
            title,
            text_writer: writer_id,
            blob_id: blobId,
        })
        .returning('text_id')
        .executeTakeFirstOrThrow();

    return insertedText.text_id as number;
};

/**
 * Returns all blob IDs associated with a given writer ID.
 * @param writerId - The ID of the writer.
 * @returns An array of blob ID strings.
 */
export const getBlobIdsForWriter = async (writerId: number): Promise<string[]> => {
    const rows = await db
        .selectFrom('texts')
        .select(['blob_id'])
        .where('text_writer', '=', writerId)
        .execute()

    return rows.map(row => row.blob_id)
}

export const fetchTexts = async () => {
    return await db
        .selectFrom('texts')
        .select(['text_id as textId', 'title as title', 'text_writer as textWriter', 'blob_id as blobId'])
        .execute()
}


export const getText = async (textId: number) => {
    return await db
        .selectFrom('texts')
        .select(['text_id as textId', 'title as title', 'text_writer as textWriter', 'blob_id as blobId'])
        .where('text_id', '=', textId)
        .executeTakeFirstOrThrow()
}


export const deleteText = async (textId: number) => {
    const text= await getText(textId)
    const writerId = text.textWriter
    const blobId = text.blobId
    //TODO(): Wrap these in a db transaction:
    await deleteTextById(textId)
    await deleteWriterIfNecessary(writerId)

    await deleteBlob(blobId)
}

export const deleteTextById = async(textId: number): Promise<void> => {
    await db
        .deleteFrom('texts')
        .where('text_id', '=', textId)
        .execute()
}
