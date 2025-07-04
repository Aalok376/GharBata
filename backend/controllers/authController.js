import User from '../models/user.js'
import OtpStore from '../models/verificationOtp.js'
import TokenStore from '../models/RefreshToken.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendEmail } from '../utils/email.js'

export const verificationOtp = async (req, res) => {
  const { username, password } = req.body

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
  }

  if (!username || !password) {
    return res.status(400).json({ msg: 'Please provide all data' })
  }
  else if (!validatePassword(password)) {
    return res.status(400).json({
      success: false,
      msg: 'Password must be at least 8 characters long and include at least one letter and one number.',
    })
  }
  else {
    try {
      const existinguser = await User.findOne({ username })
      if (existinguser) {
        return res.status(409).json({ msg: 'Username already taken' })
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      sendEmail(username, otp)

      const otpDb = new OtpStore({ username, otp })
      await otpDb.save()
      return res.status(200).json({ msg: 'OTP sent to your email. Please verify to complete signup.' })
    }
    catch (error) {
      console.log(error)
      return res.status(500).json({ error })
    }
  }
}
//Register Function
export const Register = async (req, res) => {
  const { username, password, fname, lname, userType } = req.body
  try {
    const user = new User({ fname, lname, username, password, userType })
    await user.save();
    return res.status(200).json({ success: true, msg: 'User created successfully.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, msg: 'Internal server error' })
  }
}
// Login function
export const login = async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials: User not found.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials: Incorrect password.' })
    }

    const AccessToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' })
    res.cookie('accessToken', AccessToken, { httpOnly: true })

    const RefreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET)
    const tokenStoree = new TokenStore({ username, RefreshToken })
    await tokenStoree.save()
    res.cookie('refreshToken', RefreshToken, { httpOnly: true, maxAge: 7 * 86400 * 1000 })

    return res.status(200).json({ success: true, message: "Logged in successfully" })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, msg: 'Internal server error' })
  }
}

