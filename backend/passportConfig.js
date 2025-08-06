import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from './models/user.js'
import dotenv from 'dotenv'

dotenv.config()

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `https://gharbata.onrender.com/auth/google/callback`,
  passReqToCallback: true,
}, async (req, AccessToken, RefreshToken, profile, done) => {
  try {
    const userType = req.session.userType || 'client'

    let user = await User.findOne({ oauthId: profile.id, provider: 'google' })

    if (!user) {
      user = await User.create({
        oauthId: profile.id,
        provider: 'google',
        userType,
        fname: profile.name?.givenName || '',
        lname: profile.name?.familyName || '',
        username: profile.emails?.[0]?.value || '', // store email in username
        isProfileComplete: false,
      })
    }

    done(null, user)
  } catch (err) {
    done(err, null)
  }
}))
