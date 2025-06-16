import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

// Register function
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (default role: 'client' if not provided)
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'client'
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(user);

    res.status(201).json({ message: "User registered successfully" });
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
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Exclude password from response
    const { password: _, ...userData } = user.toObject();

    res.status(200).json({
      message: "Logged in successfully",
      token,
      user: userData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Configure email transporter (example using Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate verification token
const generateVerificationToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Send verification email
export const sendVerificationEmail = async (user) => {
  try {
    const verificationToken = generateVerificationToken(user._id);
    
    // Save token to user document
    user.verificationToken = verificationToken;
    await user.save();

    // Email content
    const mailOptions = {
      from: `GharBata <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Verify Your Email Address',
      html: `
        <h2>Welcome to GharBata!</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${process.env.BASE_URL}/verify-email?token=${verificationToken}">
          Verify Email
        </a>
        <p>Link expires in 1 hour.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

// Verify Email function
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification link' });
    }

    if (user.verificationToken !== token) {
      return res.status(400).json({ message: 'Invalid verification link' });
    }

    // Mark user as verified
    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Verification link expired' });
    }
    res.status(500).json({ message: error.message });
  }
};

