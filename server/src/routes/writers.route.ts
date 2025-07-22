const express = require('express');
const {
    fetchWriters,
    getProcessingWriters,
    getWritersByConversation
} = require('../controllers/writer.controller');

const writersRouter = express.Router();

writersRouter.get('/', fetchWriters);
writersRouter.get('/processing', getProcessingWriters);
writersRouter.get('/conversation/:conversationId', getWritersByConversation);

module.exports = writersRouter;