import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'


import Client_Login from './pages/Client_Login'
import Client_Signup from './pages/Client_Signup'
import HomePageFunc from './pages/IntroductionPage'
import ProfessionalPage from './pages/professionalHomePage'
import ClientPage from './pages/clientHomePage'
import Overlay_Otp from './components/otpOverlay'
import ChatPage from './pages/Chat_page'
import ProfessionalProfilePage from './pages/professionalProfile'
import BookingForm from './pages/bookingform'
import TechnicianDisplayPage from './pages/professionalList'
import MapPickerModal from './pages/MapPicker'
import { SelectLocationOverlay } from './components/selectLocation'
import ClientProfilePage from './pages/clientProfilePage'
<<<<<<< HEAD
import TechnicianReviewsPage from './pages/reviewsPage'
import OAuthSuccess from './pages/oAuth';
=======
import BookingDashboard from './components/BookingDashboard'
>>>>>>> 0573d4c (error handling)

function App() {
  return (
    <Router>
      <Routes>
<<<<<<< HEAD
        <Route path='/' element={<HomePageFunc />} />
        <Route path='/client/dashboard' element={<ClientPage />} />
        <Route path='/gharbata/login' element={<Client_Login />} />
        <Route path='/gharbata/signup' element={<Client_Signup />} />
        <Route path='/otp' element={<Overlay_Otp />} />
        <Route path='/professional/dashboard' element={<ProfessionalPage />} />
        <Route path='/professionalProfilePage/:userId' element={<ProfessionalProfilePage />} />
        <Route path='/chat/' element={<ChatPage />} />
        {/* <Route path='/chat/:bookingId' element={<ChatPage />} /> */}
        <Route path='/booking-form' element={<BookingForm />} />
        <Route path='/client/dashboard/bookservice/:serviceName' element={<TechnicianDisplayPage />} />
        <Route path='/clientProfileSetupPage/:userId' element={<ClientProfilePage />} />
        <Route path='/client/dashboard/booking/:service/:technicianId' element={<BookingForm />} />
        <Route path='/professional/reviews/:userId' element={<TechnicianReviewsPage />} />
        <Route path='/oauth-success' element={<OAuthSuccess />} />
=======
        <Route path='/' element={<HomePageFunc/>}/>
        <Route path='/dashboard' element={<ClientPage/>}/>
        <Route path='/client_login' element={<Client_Login/>}/>
        <Route path='/client_signup' element={<Client_Signup/>}/>
        <Route path='/technician_login' element={<Technician_Login/>}/>
        <Route path='/technician_signup' element={<Technician_Signup/>}/>
        <Route path='/otp' element={<Overlay_Otp/>}/>
        <Route path='/professional' element={<ProfessionalPage/>}/>
        <Route path='/professionalProfilePage/:userId' element={<ProfessionalProfilePage/>}/>
        <Route path='/chat/:bookingId' element={<ChatPage/>}/>
        <Route path='/booking-form' element={<BookingForm/>}/>
        <Route path="/dashboard/bookservice/:serviceName" element={<TechnicianDisplayPage/>} />
        <Route path='/clientProfileSetupPage/:userId' element={<ClientProfilePage/>}/>
        <Route path="/dashboard/booking/:service/:technicianId" element={<BookingForm/>} />
         <Route path="/my-bookings" element={<BookingDashboard />} />
>>>>>>> 0573d4c (error handling)
      </Routes>
    </Router>

  )
}

export default App