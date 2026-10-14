import { Router } from 'express';
import {
  getPendingEmployers,
  reviewEmployer,
  getPendingJobs,
  reviewJob,
  getCategories,
  addCategory,
  deleteCategory,
  getLocations,
  addLocation,
  deleteLocation,
  getReports,
  handleReport
} from '../controllers/adminController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

// Publicly readable for dropdowns
router.get('/categories', getCategories);
router.get('/locations', getLocations);

// Admin-only endpoints
router.use(authenticateJWT, requireRole('ADMIN'));

router.get('/employers', getPendingEmployers);
router.post('/employers/:id/review', reviewEmployer);

router.get('/jobs', getPendingJobs);
router.post('/jobs/:id/review', reviewJob);

router.post('/categories', addCategory);
router.delete('/categories/:id', deleteCategory);

router.post('/locations', addLocation);
router.delete('/locations/:id', deleteLocation);

router.get('/reports', getReports);
router.post('/reports/:id/action', handleReport);

export default router;
