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
}))

// Middleware to store userType from query param in session
app.use((req, res, next) => {
  if (req.query.userType) {
    req.session.userType = req.query.userType
  }
  next()
})

app.use(passport.initialize())
app.use(passport.session())

import authRoutes from './routes/Login.js'
import clientRoutes from './routes/clientRoutes.js'
import technicianRoutes from './routes/technicianRoutes.js'
import boookingroutes from './controllers/bookingController.js'


app.use('/api/auth', authRoutes)

app.use('/api/clients',clientRoutes)
app.use('/api/technicians',technicianRoutes)
app.use('/api/bookings',boookingroutes)


app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

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
  const { lat, lon } = req.query

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat or lon query params' })
  }

  const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjZhYzc3NTgwMzE4YTQyMTViZDYxMmViZmNkMjIzYjAwIiwiaCI6Im11cm11cjY0In0="
  const url = `https://api.openrouteservice.org/geocode/reverse?api_key=${ORS_API_KEY}&point.lat=${lat}&point.lon=${lon}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (!data.features || data.features.length === 0) {
      return res.status(404).json({ error: 'No address found' })
    }

    const feature = data.features[0]
    const display_name = feature.properties.name
    console.log(display_name)

    res.json({
      lat,
      lon,
      display_name,
      raw: feature
    })
  } catch (err) {
    console.error('Reverse geocode error:', err)
    res.status(500).json({ error: 'Failed to fetch from ORS' })
  }
})

app.get('/geocode', async (req, res) => {
  const locationName = req.query.q

  if (!locationName) {
    return res.status(400).json({ error: "Missing required query param 'q'" })
  }

  const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjZhYzc3NTgwMzE4YTQyMTViZDYxMmViZmNkMjIzYjAwIiwiaCI6Im11cm11cjY0In0="
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(locationName)}&size=1`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (!data.features || data.features.length === 0) {
      return res.status(404).json({ error: 'No results found' })
    }

    const feature = data.features[0]
    const [lon, lat] = feature.geometry.coordinates
    const display_name = feature.properties.label

    res.json({ lat, lon, display_name })
  } catch (err) {
    console.error('Geocoding error:', err)
    res.status(500).json({ error: 'Failed to fetch from ORS' })
  }
})

export default app