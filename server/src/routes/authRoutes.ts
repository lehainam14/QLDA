import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { uploadLicense } from '../middleware/upload.js';

const router = Router();

// Upload license file if role is EMPLOYER
router.post('/register', uploadLicense.single('license_file'), register);
router.post('/login', login);
router.get('/me', authenticateJWT, getMe);

export default router;
