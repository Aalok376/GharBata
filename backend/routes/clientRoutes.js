import express from 'express';
// import { protect, authorize } from '../middlewares/authMiddleware.js';
import { createClient } from '../controllers/clientController.js';

const router = express.Router();

// router.use(protect);
router.post('/', createClient);
// router.get('/', authorize('client'), getClientProfile);

export default router;