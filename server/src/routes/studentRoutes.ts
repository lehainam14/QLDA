import { Router } from 'express';
import {
  getStudentProfile,
  updateStudentProfile,
  applyJob,
  getStudentApplications
} from '../controllers/studentController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';

const router = Router();

router.use(authenticateJWT, requireRole('STUDENT'));

router.get('/profile', getStudentProfile);
router.put('/profile', uploadResume.single('cv_file'), updateStudentProfile);
router.post('/apply', uploadResume.single('cv_file'), applyJob);
router.get('/applications', getStudentApplications);

export default router;
