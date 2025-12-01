const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model');
const aiService = require('../sockets/services/ai.service');
const { creatememory, querymemory } = require('../sockets/services/vector.service');

async function createChat(req, res) {
    try {
        console.log('Create chat request received');
        const { title } = req.body;
        
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }
        
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        
        const chat = await chatModel.create({ title, user: user._id });
        console.log('Chat created:', chat._id);
        res.status(201).json({ 
            message: 'Chat created successfully', 
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        });
    } catch (error) {
        console.error('Create chat error:', error);
        res.status(500).json({ message: 'Failed to create chat', error: error.message });
    }
}

async function sendMessage(req, res) {
    try {
        const { chatId, content } = req.body;
        const userId = req.user._id;

        if (!chatId || !content) {
            return res.status(400).json({ message: 'Chat ID and message content required' });
        }

        // Save user message
        const userMessage = await messageModel.create({
            chat: chatId,
            user: userId,
            content,
            role: 'user'
        });

        // Generate AI response
        const vectors = await aiService.generateVector(content);
        
        await creatememory({
            vectors,
            messageid: userMessage._id,
            metadata: { userId: userId.toString(), chatId, text: content }
        });

        // Get memory and chat history
        const [memory, chatHistory] = await Promise.all([
            querymemory({
                queryVector: vectors,
                limit: 3,
                metadata: { user: userId.toString() }
            }),
            messageModel
                .find({ chat: chatId })
                .sort({ createdAt: -1 })
                .limit(25)
                .lean()
                .then(messages => messages.reverse())
        ]);

        const stm = chatHistory.map(item => ({
            role: item.role,
            parts: [item.content]
        }));

        const memoryText = memory
            .map(m => {
                try {
                    return m.metadata?.text || '';
                } catch (e) {
                    return '';
                }
            })
            .filter(Boolean)
            .join(' ||| ');

        const ltm = [{
            role: 'system',
            parts: [{
                text: `these are the relevant pieces of past conversation memory between the user and the AI model to help provide contextually relevant responses: ${memoryText}`
            }]
        }];

        const aiResponse = await aiService.generateResponse([...ltm, ...stm]);

        // Save AI response
        const aiMessage = await messageModel.create({
            chat: chatId,
            user: userId,
            content: aiResponse,
            role: 'model'
        });

        const responseVectors = await aiService.generateVector(aiResponse);
        await creatememory({
            vectors: responseVectors,
            messageid: aiMessage._id,
            metadata: { userId: userId.toString(), chatId, text: aiResponse }
        });

        // Get all messages for this chat
        const allMessages = await messageModel
            .find({ chat: chatId })
            .sort({ createdAt: 1 })
            .lean();

        // Transform role names for frontend compatibility
        const transformedMessages = allMessages.map(msg => ({
            ...msg,
            role: msg.role === 'model' ? 'assistant' : msg.role,
            timestamp: msg.createdAt || msg.timestamp
        }));

        res.json({
            message: 'Message sent successfully',
            messages: transformedMessages
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
}

async function getMessages(req, res) {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        // Validate chatId
        if (!chatId || chatId === 'undefined') {
            return res.status(400).json({ message: 'Chat ID is required', messages: [] });
        }

        const messages = await messageModel
            .find({ chat: chatId })
            .sort({ createdAt: 1 })
            .lean();

        // Transform role names for frontend compatibility
        const transformedMessages = messages.map(msg => ({
            ...msg,
            role: msg.role === 'model' ? 'assistant' : msg.role,
            timestamp: msg.createdAt || msg.timestamp
        }));

        res.json({ messages: transformedMessages });
    } catch (error) {
        console.error('Get messages error:', error);
        // Return empty messages array for invalid chatId instead of throwing error
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid chat ID', messages: [] });
        }
        res.status(500).json({ message: 'Failed to get messages', error: error.message });
    }
}

async function getUserChats(req, res) {
    try {
        const userId = req.user._id;

        const chats = await chatModel
            .find({ user: userId })
            .sort({ lastActivity: -1 })
            .select('_id title lastActivity createdAt')
            .lean();

        res.json(chats);
    } catch (error) {
        console.error('Get user chats error:', error);
        res.status(500).json({ message: 'Failed to get chats', error: error.message });
    }
}

async function deleteChat(req, res) {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        if (!chatId) {
            return res.status(400).json({ message: 'Chat ID is required' });
        }

        // Find the chat and verify it belongs to the user
        const chat = await chatModel.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        if (chat.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized: Chat does not belong to this user' });
        }

        // Delete all messages in this chat
        await messageModel.deleteMany({ chat: chatId });

        // Delete the chat itself
        await chatModel.findByIdAndDelete(chatId);

        res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
        console.error('Delete chat error:', error);
        res.status(500).json({ message: 'Failed to delete chat', error: error.message });
    }
}

async function updateChat(req, res) {
    try {
        const { chatId } = req.params;
        const { title } = req.body;
        const userId = req.user._id;

        if (!chatId) {
            return res.status(400).json({ message: 'Chat ID is required' });
        }

        if (!title || title.trim() === '') {
            return res.status(400).json({ message: 'Chat title is required' });
        }

        // Find the chat and verify it belongs to the user
        const chat = await chatModel.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        if (chat.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized: Chat does not belong to this user' });
        }

        // Update the chat title
        chat.title = title.trim();
        await chat.save();

        res.json({ 
            message: 'Chat updated successfully',
            chat: {
                _id: chat._id,
                title: chat.title,
                lastActivity: chat.lastActivity
            }
        });
    } catch (error) {
        console.error('Update chat error:', error);
        res.status(500).json({ message: 'Failed to update chat', error: error.message });
    }
}

module.exports = { createChat, sendMessage, getMessages, getUserChats, deleteChat, updateChat };