import OtpStore from '../models/verificationOtp.js'

export const verifyOtp = async (req, res, next) => {
  try {
    const { username, userInputOtp } = req.body

    const record = await OtpStore.findOne({ username })
    if (!record) {
      return res.status(400).json({ success: false, msg: 'OTP has expired or is invalid' })
    }

    const { otp } = record

    if (otp !== userInputOtp) {
      return res.status(400).json({ success: false, msg: 'Invalid OTP' })
    }

    await OtpStore.deleteOne({ username })

    next()
  } catch (error) {
    console.error('OTP verification failed:', error)
    res.status(500).json({ success: false, msg: 'Internal server error' })
  }
}
