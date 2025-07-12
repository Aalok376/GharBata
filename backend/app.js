import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express() 

app.use(cors({
  origin:'*',
})) 

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

import authRoutes from './routes/Login.js'
import chatRoutes from './routes/chatRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js' 
import clientRoutes from './routes/clientRoutes.js'
import technicianRoutes from './routes/technicianRoutes.js'
import serviceRoutes from './routes/serviceRoutes.js'

app.use('/api/auth', authRoutes)
app.use('/api/bookings', bookingRoutes) 
app.use('/api/clients',clientRoutes)
app.use('/api/technicians',technicianRoutes)
app.use('/api/services',serviceRoutes)
app.use('/api/chat', chatRoutes)

export default app