import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import shopRoutes from './routes/shops.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import categoryRoutes from './routes/categories.js';
import reviewRoutes from './routes/reviews.js';
import cartRoutes from './routes/cart.js';
import wishlistRoutes from './routes/wishlist.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';
import paymentRoutes from './routes/payments.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Accept requests from Live Server, direct file, or any localhost
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like direct file:// opens or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // permissive for dev — tighten in production
    }
  },
  credentials: true
};

const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] }
});

// Store io on app for use in routes
app.set('io', io);

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join order room for tracking
  socket.on('joinOrderRoom', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Socket ${socket.id} joined order_${orderId}`);
  });

  // Delivery location update
  socket.on('deliveryLocation', (data) => {
    io.to(`order_${data.orderId}`).emit('locationUpdate', data);
  });

  // Chat messages
  socket.on('joinChat', (chatId) => {
    socket.join(`chat_${chatId}`);
  });

  socket.on('sendMessage', (data) => {
    io.to(`chat_${data.chatId}`).emit('newMessage', data);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Connect to DB and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`\n  🚀 QuickOutfit API running on port ${PORT}`);
    console.log(`  📡 Socket.io ready`);
    console.log(`  🌐 Client: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
  });
};

startServer();
