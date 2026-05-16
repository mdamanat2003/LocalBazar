require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const initializeSocket = require('./services/socket.service');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Initialize Socket.io (For live tracking later)
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict this to your app's domain
    methods: ['GET', 'POST']
  }
});
initializeSocket(io);
// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true }));


// Basic Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Quick Commerce API is running 🚀' });
});

// Make io accessible globally if needed, or pass it to routes
app.set('io', io);

// We will import and use routes here later
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/shops', require('./routes/shop.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/delivery', require('./routes/delivery.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});