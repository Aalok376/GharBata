import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express() 

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true             
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

import authRoutes from './routes/Login.js'
import chatRoutes from './routes/chatRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js' 
import clientRoutes from './routes/clientRoutes.js'
import technicianRoutes from './routes/technicianRoutes.js'


app.use('/api/auth', authRoutes)
app.use('/api/bookings', bookingRoutes) 
app.use('/api/clients',clientRoutes)
app.use('/api/technicians',technicianRoutes)

app.use('/api/chat', chatRoutes)


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