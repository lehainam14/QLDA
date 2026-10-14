import { Router } from 'express';
import {
  getJobs,
  getJobById,
  toggleSaveJob,
  getSavedJobs,
  reportJob
} from '../controllers/jobController.js';
import { authenticateJWT, optionalAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Public / optional auth for browsing
router.get('/', optionalAuth, getJobs);
router.get('/saved', authenticateJWT, requireRole('STUDENT'), getSavedJobs);
router.get('/:id', optionalAuth, getJobById);

// Actions requiring authentication
router.post('/save', authenticateJWT, requireRole('STUDENT'), toggleSaveJob);
router.post('/report', optionalAuth, reportJob);

export default router;
