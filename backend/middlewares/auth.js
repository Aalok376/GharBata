import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
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
    req.user = decoded; // Attach user data to request object
    next(); // Proceed to the next middleware/route
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
