import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../utils/email.js';

// Register function
export const register = async (req, res) => {
  try {
    const { fullName, email, password, role, phoneNumber } = req.body;

    const existingUser = await User.findOne({ email }); // Check if user already exists
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
     // const hashedPassword = await bcrypt.hash(password, 10); // Hash the password


    // Create user (default role: 'client' if not provided)
    const user = new User({
      fullName: fullName,
      email,
      password,
      role: role || 'client',
      phoneNumber
    });

    await user.save();

    await sendVerificationEmail(user);// Send verification email

    res.status(201).json({ message: "User registered successfully. Please verify your email." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login function
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials: User not found.' });
    }

    // Check if email is verified. Remove this check if user is allowed login without email verification.
    if (user.emailVerificationToken) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials: Incorrect password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Remove sensitive data before sending
    const { password: _, emailVerificationToken, passwordResetToken, passwordResetExpires, ...userData } = user.toObject();

    res.status(200).json({
      message: "Logged in successfully",
      token,
      user: userData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify Email function
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Token Decoded
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: 'Invalid Token or User not found' });
    }

    if (user.emailVerificationToken !== token) {
      return res.status(400).json({ message: 'Invalid or expired Token' });
    }

    // Mark user as verified
    // user.verified = true;
    user.emailVerificationToken = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Verification link expired' });
    }
    res.status(500).json({ message: error.message });
  }
};

