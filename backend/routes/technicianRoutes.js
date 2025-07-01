import express from 'express';
// import { protect, authorize } from '../middlewares/authMiddleware.js';
import { createTechnician } from '../controllers/technicianController.js';

const router = express.Router();

// router.use(protect);
router.post('/', createTechnician);
// router.get('/', authorize('technician'), getTechnicianProfile);

export default router;