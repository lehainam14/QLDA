import { Router } from 'express';
import {
  getEmployerDashboard,
  createJob,
  updateJob,
  getJobApplicants,
  markApplicationViewed,
  updateApplicantStatus
} from '../controllers/employerController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateJWT, requireRole('EMPLOYER'));

router.get('/dashboard', getEmployerDashboard);
router.post('/jobs', createJob);
router.put('/jobs/:id', updateJob);
router.get('/applicants', getJobApplicants);
router.post('/applicants/:id/view', markApplicationViewed);
router.patch('/applicants/:id/status', updateApplicantStatus);

export default router;
