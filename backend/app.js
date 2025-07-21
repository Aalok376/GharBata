import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'


const app = express() 

app.use(cors({
  origin:'http://localhost:5173',
  credentials: true,
})); 

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

import authRoutes from './routes/Login.js'
import chatRoutes from './routes/chatRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js' 
import clientRoutes from './routes/clientRoutes.js'
import technicianRoutes from './routes/technicianRoutes.js'
import serviceRoutes from './routes/serviceRoutes.js'
import esewaRoutes from './routes/esewaRoutes.js';

app.use('/api/auth', authRoutes)
app.use('/api/bookings', bookingRoutes) 
app.use('/api/clients',clientRoutes)
app.use('/api/technicians',technicianRoutes)
app.use('/api/services',serviceRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/payment/esewa', esewaRoutes)


export default app