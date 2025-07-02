import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import nodemailer from 'nodemailer';

export const generateVerificationToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};


export const sendVerificationEmail = async (user) => {
  try {
    const transporter = getTransporter();
    const verificationToken = generateVerificationToken(user._id);

    user.emailVerificationToken = verificationToken;
    await user.save();
    
    const mailOptions = {
      from: `GharBata <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Verify Your Email Address',
      html: `
        <h2>Welcome to GharBata!</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}">
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

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // 2. Check if user is already verified
    if (!user.emailVerificationToken) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // 3. Resend verification email (this will generate a new token internally)
    await sendVerificationEmail(user);

    res.status(200).json({ message: 'Verification email resent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
