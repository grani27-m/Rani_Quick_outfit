import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { message, chatHistory = [], contextData = {} } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ message: 'AI Chat is currently unavailable (Missing API Key)' });
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build the system prompt using dynamic context from the frontend and user role
    const systemPrompt = `You are an expert, helpful AI assistant built directly into the "QuickOutfit" platform, a hyperlocal fashion marketplace.
Your current user is a ${req.user.role}. Their name is ${req.user.name}.
${contextData.skinTone ? `Their identified skin tone is: ${contextData.skinTone}.` : ''}
${contextData.bodyType ? `Their identified body shape/type is: ${contextData.bodyType}.` : ''}

Rules:
- Give concise, clear, and extremely accurate advice. Use markdown for readability (bullet points, bold text).
- If the user is a "customer", act as their personal fashion stylist. Recommend flattering fits, color palettes based on their tone, and style pairings. Emphasize "QuickOutfit" speed (same-day local delivery).
- If the user is a "shopkeeper", act as a platform support expert. Help them understand how to upload products, improve their shop descriptions, handle orders, or analyze trends.
- If the user asks about something unrelated to fashion, shopping, or the QuickOutfit platform, politely pivot back to fashion and local shopping.
- For dress recommendations, specifically mention the silhouettes (A-line, bodycon, wrap, empire waist, peplum, etc.) that flatter their body type and the exact colors that flatter their skin tone.
`;

    // Convert chatHistory to Gemini format
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}` }] },
        { role: 'model', parts: [{ text: 'Understood. I am ready to help.' }] },
        ...formattedHistory
      ]
    });

    const result = await chat.sendMessage(message);
    const replyText = result.response.text();

    res.json({ reply: replyText });
  } catch (error) {
    console.error('Chat AI Error:', error);
    res.status(500).json({ message: 'Failed to generate response', error: error.message });
  }
});

export default router;
