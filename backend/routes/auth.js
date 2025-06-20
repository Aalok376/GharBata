import express from 'express';
import { register, login, verifyEmail } from '../controllers/authController.js';
import { resendVerificationEmail } from '../utils/email.js';

// import { authMiddleware } from './middlewares/auth.js';

// app.get('/api/protected', authMiddleware, (req, res) => {
//   res.json({ message: `Hello, ${req.user.email}` });
// });

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);


export default router;