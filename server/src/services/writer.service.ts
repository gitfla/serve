const db = require('../db/database');

export const fetchWriters = async () => {
    return await db
        .selectFrom('writers')
        .select(['writer_id as writerId', 'writer_name as writerName'])
        .execute()
}

export async function deleteWriterById(writerId: number): Promise<void> {
    await db
        .deleteFrom('writers')
        .where('writer_id', '=', writerId)
        .execute()
}

export async function countTextsByWriter(writerId: number): Promise<number> {
    const result = await db
        .selectFrom('texts')
        .select(({ fn }) => [fn.countAll().as('count')])
        .where('text_writer', '=', writerId)
        .executeTakeFirst()

    return Number(result?.count || 0)
}

export async function deleteWriterIfNecessary(writerId: number): Promise<void> {
    const count = await countTextsByWriter(writerId)
    if (count === 0) {
        await deleteWriterById(writerId)
    }
}
