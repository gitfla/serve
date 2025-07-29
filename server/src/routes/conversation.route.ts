import { Router } from 'express';

const { getBestSentenceMatch, startConversation, checkConversationExists, getConversationDetailsController, getConversationMessagesController } = require('../controllers/conversation.controller');

const conversationRouter = Router();

conversationRouter.post('/start', startConversation)
conversationRouter.post('/getNext', getBestSentenceMatch)
conversationRouter.get('/:conversationId', checkConversationExists)
conversationRouter.get('/:conversationId/details', getConversationDetailsController);
conversationRouter.get('/:conversationId/messages', getConversationMessagesController);

module.exports = conversationRouter;