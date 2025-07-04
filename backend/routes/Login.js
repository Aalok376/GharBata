import express from 'express'
import { Register, login, verificationOtp, Logout, deleteUser } from '../controllers/authController.js'
import { verifyOtp } from '../utils/verifyOtp.js'
import { verifyToken } from '../middlewares/auth.js'

const router = express.Router()

router.post('/emailVerification', verificationOtp)
router.post('/register', verifyOtp, Register)
router.post('/login', login)
router.get('/logoutuser', verifyToken, Logout)
router.delete('/delete&user$-account', verifyToken, deleteUser)

export default router