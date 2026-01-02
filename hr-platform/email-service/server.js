import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sendEmail, sendHREmail } from './routes/emailRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'HR Email Service',
    timestamp: new Date().toISOString()
  });
});

// Email endpoints
app.post('/api/send-email', sendEmail);
app.post('/api/send-hr-email', sendHREmail);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ [Server] Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 [Email Service] Server running on port ${PORT}`);
  console.log(`📧 [Email Service] Health check: http://localhost:${PORT}/health`);
  console.log(`📧 [Email Service] Send email: http://localhost:${PORT}/api/send-email`);
  console.log(`📧 [Email Service] Send HR email: http://localhost:${PORT}/api/send-hr-email`);
  
  // Check for required environment variables
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  [Email Service] RESEND_API_KEY not set. Email sending will fail.');
  } else {
    console.log('✅ [Email Service] Resend API key configured');
  }
});

export default app;

