const express = require('express');

const { getBestSentenceMatch, startConversation, checkConversationExists } = require('../controllers/conversation.controller');

const conversationRouter = express.Router();

conversationRouter.post('/start', startConversation)
conversationRouter.post('/getNext', getBestSentenceMatch)
conversationRouter.get('/:conversationId', checkConversationExists)

module.exports = conversationRouter;