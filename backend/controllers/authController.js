import User from '../models/user.js'
import OtpStore from '../models/verificationOtp.js'
import TokenStore from '../models/RefreshToken.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendEmail } from '../utils/email.js'
import RefreshToken from '../models/RefreshToken.js'

export const verificationOtp = async (req, res) => {
  const { username, password, fname, lname } = req.body

  if (!username || !password) {
    return res.status(400).json({ success: false, msg: 'Please provide all data' })
  }
  else {
    try {
      const existinguser = await User.findOne({ username })
      if (existinguser) {
        return res.status(409).json({ success: false, msg: 'Username already taken' })
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      sendEmail(username, otp)

      const otpDb = new OtpStore({ username, otp })
      await otpDb.save()
      return res.status(200).json({ success: true, msg: 'OTP sent to your email. Please verify to complete signup.' })
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
    const { username, password, userType } = req.body
    console.log(password)

    const user = await User.findOne({ username })

    if (!user) {
      return res.status(401).json({ success: false, msg: 'Invalid credentials: User not found.' })
    }

    if (user.userType !== userType) {
      return res.status(401).json({ success: false, msg: 'Invalid credentials: User not found.' })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, msg: 'Invalid credentials: Incorrect password.' })
    }

    const AccessToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' })
    res.cookie('accessToken', AccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax'
    })

    const RefreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET)
    const tokenStoree = new TokenStore({ username, RefreshToken })
    await tokenStoree.save()
    res.cookie('refreshToken', RefreshToken, {
      httpOnly: true,
      maxAge: 7 * 86400 * 1000,
      secure: false,
      sameSite: 'Lax'
    })

    return res.status(200).json({ success: true, msg: "Logged in successfully" })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, msg: 'Internal server error' })
  }
}

export const Logout = async (req, res) => {
  try {
    const userID = req.user.id

    const loggedUser = await User.findById(userID)

    if (!loggedUser) {
      return res.status(404).json({ success: false, msg: 'User not found.' });
    }
    const { username } = loggedUser

    await RefreshToken.deleteOne({ username })

    res.clearCookie('refreshToken', { httpOnly: true })
    res.clearCookie('accessToken', { httpOnly: true })

    return res.status(200).json({ success: true, msg: 'Logged Out Successfully.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, msg: 'Internal server error.' })
  }
}

export const deleteUser = async (req, res) => {
  const userID = req.user.id

  const { username, password } = req.body

  try {
    const UserTodelete = await User.findById(userID)
    if (!UserTodelete) {
      return res.status(404).json({ success: false, msg: 'User not Found' })
    }
    else if (username !== UserTodelete.username) {
      return res.status(401).json({ success: false, msg: 'Invalid Username' })
    }

    const isMatch = await bcrypt.compare(password, UserTodelete.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, msg: 'Invalid credentials: Incorrect password.' })
    }

    await RefreshToken.deleteOne({ username: UserTodelete.username })
    res.clearCookie('refreshToken', { httpOnly: true })
    res.clearCookie('accessToken', { httpOnly: true })

    await User.deleteOne({ _id: userID })

    return res.status(200).json({ success: true, msg: 'User deleted Successfully' })
  } catch (error) {
    console.error(error)
    return res.status(505).json({ success: false, msg: 'Internal server error' })
  }
}
