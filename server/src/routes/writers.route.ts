import { Router } from 'express';
const {
    fetchWriters,
    getProcessingWriters,
    getWritersByConversation
} = require('../controllers/writer.controller');

const writersRouter = Router();

writersRouter.get('/', fetchWriters);
writersRouter.get('/processing', getProcessingWriters);
writersRouter.get('/conversation/:conversationId', getWritersByConversation);

module.exports = writersRouter;