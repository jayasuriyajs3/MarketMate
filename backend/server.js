const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas
connectDB();

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MarketMate API' });
});

// Import routes
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shops');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 MarketMate server running on port ${PORT}`);
});
