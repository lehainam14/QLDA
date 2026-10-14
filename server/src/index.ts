import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import employerRoutes from './routes/employerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Ensure upload folders exist
const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
['licenses', 'resumes', 'avatars'].forEach((sub) => {
  const p = path.join(uploadDir, sub);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// Middleware
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting (150 requests per 15 mins)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: 'Quá nhiều yêu cầu từ IP của bạn, vui lòng thử lại sau 15 phút.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Static uploads serving
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'Tệp tải lên vượt quá dung lượng tối đa cho phép (5MB)' });
      return;
    }
    res.status(400).json({ message: `Lỗi tải tệp: ${err.message}` });
    return;
  }

  res.status(err.status || 500).json({
    message: err.message || 'Đã xảy ra lỗi nội bộ máy chủ'
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[JobStudent API] Server running on http://localhost:${PORT}`);
    console.log(`[JobStudent API] Uploads directory: ${uploadDir}`);
  });
}

export default app;
