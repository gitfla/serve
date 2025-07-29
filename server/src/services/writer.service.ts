import db from '../db/database';

export const fetchWriters = async () => {
    return await db
        .selectFrom('writers')
        .select(['writer_id as writerId', 'writer_name as writerName'])
        .execute()
}

export const getWritersByConversation = async (conversationId: number) => {
    return await db
        .selectFrom('writers')
        .innerJoin('conversations_writers', (join) =>
            join.onRef('writers.writer_id', '=', 'conversations_writers.writer_id')
        )
        .where('conversations_writers.conversation_id', '=', conversationId)
        .select([
            'writers.writer_id as writerId',
            'writers.writer_name as writerName',
        ])
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
