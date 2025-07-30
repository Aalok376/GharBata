import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import passport from 'passport'
import dotenv from 'dotenv'
import './passportConfig.js'
import TokenStore from './models/RefreshToken.js'
import { generateAccessToken, generateRefreshToken } from './utils/tokengenerator.js'

dotenv.config()

const app = express() 

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true             
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true if HTTPS
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }
}));

// Middleware to store userType from query param in session
app.use((req, res, next) => {
  if (req.query.userType) {
    req.session.userType = req.query.userType;
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session())

import authRoutes from './routes/Login.js'
import chatRoutes from './routes/chatRoutes.js'
import clientRoutes from './routes/clientRoutes.js'
import technicianRoutes from './routes/technicianRoutes.js'
import boookingroutes from './controllers/bookingController.js'


app.use('/api/auth', authRoutes)

app.use('/api/clients',clientRoutes)
app.use('/api/technicians',technicianRoutes)
app.use('/api/bookings',boookingroutes)

app.use('/api/chat', chatRoutes)


app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  async (req, res) => {
    // User is authenticated and available at req.user

    const user = req.user

    const AccessToken = generateAccessToken(user)
    const RefreshToken = generateRefreshToken(user)

    // Save refresh token in DB
    const tokenStoree = new TokenStore({
      username: user.username,
      RefreshToken
    })
    await tokenStoree.save()

    // Set tokens as httpOnly cookies
    res.cookie('accessToken', AccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 30 * 60 * 1000, // 30 minutes
    })

    res.cookie('refreshToken', RefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Redirect to frontend with minimal user info (no tokens in URL)
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?user=${encodeURIComponent(JSON.stringify({
      id: user._id,
      username: user.username,
      userType: user.userType,
      fname: user.fname,
      lname: user.lname,
      isProfileComplete: user.isProfileComplete,
    }))}`)
  })

app.get('/reverse-geocode', async (req, res) => {
  const { lat, lon } = req.query;

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'YourAppName/1.0 (your@email.com)'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from Nominatim' });
  }
})

app.get('/geocode', async (req, res) => {
  const locationName = req.query.q;  // expecting ?q=Kathmandu or any address

  if (!locationName) {
    return res.status(400).json({ error: "Missing required query param 'q'" });
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'YourAppName/1.0 (your@email.com)'
      }
    });

    const data = await response.json();

    if (data.length === 0) {
      return res.status(404).json({ error: 'No results found' });
    }

    // Return first result's lat and lon
    const { lat, lon, display_name } = data[0];

    res.json({ lat, lon, display_name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from Nominatim' });
  }
});

export default app