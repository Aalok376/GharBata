import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const authMiddleware = async (req, res, next) => {
  // token from the Authorization header
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  // Extract the token
  const token = authHeader.split(' ')[1];

  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   // req.user = decoded;  Attach user data to request object
    const userId = decoded.userId;

   // Fetch user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }    


    // Attach to req object
    req.user = { id: user._id };
    req.userRole = user.role; 

    next(); // Proceed to the next middleware/route
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
