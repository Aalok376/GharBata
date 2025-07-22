import dotenv from 'dotenv'
import TokenStore from '../models/RefreshToken.js'
import User from '../models/user.js'
import jwt from 'jsonwebtoken'
dotenv.config()
// Middleware to verify access token and refresh token if needed
export const verifyToken = async (req, res, next) => {
  const accessToken = req.cookies.accessToken || req.headers['authorization']?.split(' ')[1]
  const refreshToken = req.cookies.refreshToken

  if (!accessToken) {
    return res.status(401).json({ msg: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET)
    req.user = decoded
    return next()
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      if (!refreshToken) {
        return res.status(401).send("No token provided")
      }
      let payload
      try {
        payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
      } catch (err) {
        return res.status(403).send("Invalid refresh token")
      }

      const userId = payload.id

      const TokenUser = await User.findById(userId)
       if (!TokenUser) {
        return res.status(403).send("User not found");
      }

      const username = TokenUser.username

      const storedToken = await TokenStore.findOne({ username, RefreshToken: refreshToken })
      if (!storedToken) {
        return res.status(403).send("Invalid refresh token")
      }

      const AccessToken = jwt.sign({ id: userId, userType: TokenUser.userType}, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' })
      res.cookie('accessToken', AccessToken, { httpOnly: true })

      req.user = { id: payload.id, userType: TokenUser.userType};
      return next()
    }
    else {
      return res.status(403).json({ msg: 'Invalid access token' })
    }
  }
};

// Middleware to authenticate access token from Authorization header (Bearer token)
export const authenticateToken=(req,res,next)=>{
  const authHeader= req.headers['authorization'];
  const token= authHeader && authHeader.split(' ')[1];
  if(!token){
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }
  jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
    if(err){
      return res.status(403).json({
        success: false,
        message: 'Invalid token'
      });
    }
    req.user= user;
    next();
  });
};

// Middleware factory to verify token AND check if user role is allowed
export const verifyTokenAndRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }
    jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }
      // user.userType should exist in token payload
      if (!allowedRoles.includes(user.userType)) {
        return res.status(403).json({ message: 'Unauthorized or invalid user role' });
      }
      req.user = user;
      next();
    });
  };
};
export default { authenticateToken, verifyToken, verifyTokenAndRole };
