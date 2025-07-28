import jwt from 'jsonwebtoken'

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, userType: user.userType },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '30m' }
  )
}

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )
}
