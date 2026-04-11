import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    role: String
  }],
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  messages: [{
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  lastMessage: String,
  lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema);
