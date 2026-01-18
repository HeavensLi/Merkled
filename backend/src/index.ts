import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Initialize Admin Account
async function initializeAdmin() {
  try {
    const adminExists = await User.findOne({ email: 'admin@merkled.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        email: 'admin@merkled.com',
        password: hashedPassword,
        name: 'Admin',
        userType: 'admin'
      });
      console.log('✅ Admin account created - Email: admin@merkled.com | Password: admin123');
    } else {
      console.log('ℹ️ Admin account already exists');
    }
  } catch (error) {
    console.error('❌ Error initializing admin:', error);
  }
}

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/merkled';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');
    await initializeAdmin();
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Import routes (we'll create these next)
import authRoutes from './routes/auth.js';
import recordRoutes from './routes/records.js';

app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
