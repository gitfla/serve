import {findBestMatchForPrompt, startConversation, getConversationDetails, getConversationMessages} from "../services/conversation.service";
import { checkConversationExists as checkConversationExistsService } from '../services/conversation.service'

exports.startConversation = async (req, res) => {
    try {
        const { writerIds } = req.body

        if (!Array.isArray(writerIds) || writerIds.length === 0) {
            return res.status(400).json({ error: 'writerIds must be a non-empty array' })
        }
        console.log(writerIds)

        const conversationId = await startConversation(writerIds)
        res.status(200).json({ conversationId })
    } catch (error) {
        console.error('Error starting conversation:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
};

exports.getConversationDetailsController = async (req, res) => {
    try {
        const conversationId = parseInt(req.params.conversationId, 10);
        if (isNaN(conversationId)) {
            return res.status(400).json({ error: 'Invalid conversation ID.' });
        }
        const details = await getConversationDetails(conversationId);
        if (!details) {
            return res.status(404).json({ error: 'Conversation details not found.' });
        }
        res.json(details);
    } catch (error) {
        console.error('Error fetching conversation details:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.getConversationMessagesController = async (req, res) => {
    try {
        const conversationId = parseInt(req.params.conversationId, 10);
        if (isNaN(conversationId)) {
            return res.status(400).json({ error: 'Invalid conversation ID.' });
        }
        const messages = await getConversationMessages(conversationId);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching conversation messages:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.getBestSentenceMatch = async (req, res) => {
    try {
        const { prompt, conversationId, nextWriter } = req.body

        if (!conversationId || conversationId == 0) {
            return res.status(400).json({ message: 'ConversationId must be valid.' })
        }

        const best = await findBestMatchForPrompt(prompt, conversationId, nextWriter)

        res.json({ best })
    } catch (err: any) {
        console.error('❌ Conversation error:', err)
        res.status(500).json({ message: 'Internal server error' })
    }
};

exports.checkConversationExists = async (req, res) => {
    try {
        const conversationId = parseInt(req.params.conversationId, 10)

        if (isNaN(conversationId) || conversationId <= 0) {
            return res.status(400).json({ error: 'Invalid conversation ID.' })
        }

        const exists = await checkConversationExistsService(conversationId)

        if (!exists) {
            return res.status(404).json({ error: 'Conversation not found.' })
        }

        return res.status(200).json({ valid: true })
    } catch (err) {
        console.error('❌ Error checking conversation existence:', err)
        return res.status(500).json({ error: 'Internal server error.' })
    }
}