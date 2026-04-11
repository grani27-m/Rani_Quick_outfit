import express from 'express';
import Chat from '../models/Chat.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/chat — get all chats for user
router.get('/', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name avatar email')
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/chat/:chatId — get chat messages
router.get('/:chatId', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants', 'name avatar email');
    
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    
    if (!chat.participants.find(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/chat — create new chat
router.post('/', protect, async (req, res) => {
  try {
    const { participantId, orderId } = req.body;
    
    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, participantId] }
    });
    
    if (!chat) {
      chat = await Chat.create({
        participants: [req.user._id, participantId],
        orderId,
        messages: []
      });
    }
    
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/chat/:chatId/message — send message
router.post('/:chatId/message', protect, async (req, res) => {
  try {
    const { text, image } = req.body;
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    
    if (!chat.participants.find(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const message = {
      sender: req.user._id,
      text,
      image,
      timestamp: new Date(),
      read: false
    };
    
    chat.messages.push(message);
    await chat.save();
    
    // Emit via socket if available
    if (req.app.get('io')) {
      req.app.get('io').to(`chat_${chat._id}`).emit('newMessage', {
        chatId: chat._id,
        message: { ...message, senderName: req.user.name }
      });
    }
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/chat/:chatId/messages/:messageId/read — mark message as read
router.patch('/:chatId/messages/:messageId/read', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    
    const message = chat.messages.id(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    
    message.read = true;
    await chat.save();
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
