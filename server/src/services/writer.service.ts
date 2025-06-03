const db = require('../db/database');

export const fetchWriters = async () => {
    return await db
        .selectFrom('writers')
        .select(['writer_id as writerId', 'writer_name as writerName'])
        .execute()
}