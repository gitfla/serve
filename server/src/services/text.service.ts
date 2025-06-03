//import { uploadToGCS } from '../utils/gcs.js';
//import { insertBookAndWriter } from '../utils/db.js';
const multer = require('multer')
const db = require('../db/database');

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
        writer_id = existingWriter.writer_id;
    } else {
        const newWriter = await db
            .insertInto('writers')
            .values({ writer_name: writerName })
            .executeTakeFirstOrThrow();

        writer_id = newWriter.insertId;
    }

    // Insert text
    const insertedText = await db
        .insertInto('texts')
        .values({
            title,
            text_writer: writer_id,
            blob_id: 1,
        })
        .executeTakeFirstOrThrow();

    return insertedText;
};