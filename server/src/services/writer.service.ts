const db = require('../db/database');

export const fetchWriters = async () => {
    return await db
        .selectFrom('writers')
        .select(['writer_id as writerId', 'writer_name as writerName'])
        .execute()
}

export const getWritersByConversation = async (conversationId: number) => {
    return await db
        .selectFrom('writers as w')
        .innerJoin('conversation_writers as cw', 'w.writer_id', 'cw.writer_id')
        .where('cw.conversation_id', '=', conversationId)
        .select(['w.writer_id as writerId', 'w.writer_name as writerName'])
        .execute();
};

export async function getProcessingWriterIds(): Promise<{ text_writer: number }[]> {
    return await db
        .selectFrom('processing_jobs as pj')
        .innerJoin('texts as t', 'pj.text_id', 't.text_id')
        .select(['t.text_writer'])
        .distinct()
        .where('pj.status', '!=', 'completed')
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
