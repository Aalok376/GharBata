import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'


import HomePageFunc from './pages/IntroductionPage'
import OAuthSuccess from './pages/oAuth'
import Client_Login from './pages/Client_Login'
import Client_Signup from './pages/Client_Signup'
import Overlay_Otp from './components/otpOverlay'


import ClientPage from './pages/clientHomePage'
import TechnicianDisplayPage from './pages/professionalList'
import ClientProfilePage from './pages/clientProfilePage'
import BookingForm from './pages/bookingform'
import ClientBookingDashboard from './pages/BookingDashboardForClient'


import ProfessionalPage from './pages/professionalHomePage'
import ProfessionalProfilePage from './pages/professionalProfile'
import BookingDashboard from './pages/BookingDashboard'
import TechnicianReviewsPage from './pages/reviewsPage'


import MapPickerModal from './pages/MapPicker'

import MessagingApp from './pages/chatPage'

function App() {
  return (
    <Router>
      <Routes>

        {/*Login Routes*/}
        <Route path='/' element={<HomePageFunc />} />
        <Route path='/oauth-success' element={<OAuthSuccess />} />
        <Route path='/gharbata/login' element={<Client_Login />} />
        <Route path='/gharbata/signup' element={<Client_Signup />} />
        <Route path='/otp' element={<Overlay_Otp />} />


        <Route path='/clientProfileSetupPage/:userId' element={<ClientProfilePage />} />
        <Route path='/client/dashboard' element={<ClientPage />} />
        <Route path='/client/dashboard/bookservice/:serviceName' element={<TechnicianDisplayPage />} />
        <Route path='/client/dashboard/booking/:service/:technicianId/:finalPrice' element={<BookingForm />} />
        <Route path='/client/orders/:clientId' element={<ClientBookingDashboard />} />


        <Route path='/professional/dashboard' element={<ProfessionalPage />} />
        <Route path='/professionalProfilePage/:userId' element={<ProfessionalProfilePage />} />
        <Route path='/professional/bookings/:technicianId' element={<BookingDashboard />} />
        <Route path='/professional/reviews/:technicianId' element={<TechnicianReviewsPage />} />
        <Route path='/bookings/direction/:lat/:lon' element={<MapPickerModal />} />

        <Route path='/dashboard/chats/:userId' element={<MessagingApp />} />
      </Routes>
    </Router>

  )
}

export default App