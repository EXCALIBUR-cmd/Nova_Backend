const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const chatController = require('../controllers/chat.controller');

router.get('/', authMiddleware.authUser, chatController.getUserChats);
router.post('/', authMiddleware.authUser, chatController.createChat);
router.put('/:chatId', authMiddleware.authUser, chatController.updateChat);
router.delete('/:chatId', authMiddleware.authUser, chatController.deleteChat);
router.post('/:chatId/messages', authMiddleware.authUser, chatController.sendMessage);
router.get('/:chatId/messages', authMiddleware.authUser, chatController.getMessages);

module.exports = router;