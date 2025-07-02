import express from 'express';
import { register, login, verifyEmail } from '../controllers/authController.js';
import { resendVerificationEmail } from '../utils/email.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);


export default router;