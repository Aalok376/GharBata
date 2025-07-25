import React, { useEffect, useState } from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'


import HomePageFunc from './pages/IntroductionPage'

import Client_Login from './pages/Client_Login'
import Client_Signup from './pages/Client_Signup'
import ClientPage from './pages/clientHomePage'  // only one import here

import Technician_Signup from './pages/Technician_Signup'
import Technician_Login from './pages/Technician_Login'
import ProfessionalPage from './pages/professionalHomePage'
import Overlay_Otp from './components/otpOverlay'
import ChatPage from './pages/Chat_page'

import ProfessionalProfilePage from './pages/professionalProfile'
import BookingForm from './pages/bookingform'
import TechnicianDisplayPage from './pages/professionalList'
import ClientProfilePage from './pages/clientProfilePage'
import BookingDashboard from './components/BookingDashboard'
import CreateBooking from './components/CreateBooking'
import PaymentPage from './pages/PaymentPage'
import PaymentSuccess from './components/PaymentSuccess'
import PaymentFailure from './components/PaymentFailure'
import PaymentStatus from './components/PaymentStatus'



function App(){
 return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePageFunc/>}/>
        <Route path='/dashboard' element={<ClientPage/>}/>
        <Route path='/client_login' element={<Client_Login/>}/>
        <Route path='/client_signup' element={<Client_Signup/>}/>
        <Route path='/dashboard' element={<ClientPage/>}/>

        <Route path='/technician_login' element={<Technician_Login/>}/>
        <Route path='/technician_signup' element={<Technician_Signup/>}/>
        <Route path='/professional' element={<ProfessionalPage/>}/> # This is the professional dashboard page
        <Route path='/professionalProfilePage' element={<ProfessionalProfilePage/>}/> # This is the professional profile page
        <Route path='/technicians' element={<TechnicianDisplayPage/>}/> # This is the page where all professionals are displayed
        
        <Route path="/bookings" element={<BookingDashboard />} /> # This page displays all the bookings for the client
        <Route path='/booking-form' element={<BookingForm/>}/> # This is the booking form page where the client can book a service
        
        <Route path='/otp' element={<Overlay_Otp/>}/>
        <Route path='/chat/:bookingId' element={<ChatPage/>}/>
        <Route path='/booking-form' element={<BookingForm/>}/>
        <Route path='/technicians' element={<TechnicianDisplayPage/>}/>
        <Route path='/clientProfileSetupPage' element={<ClientProfilePage/>}/>
           <Route path="/my-bookings" element={<BookingDashboard />} />
           <Route path="/create-booking" element={<CreateBooking />} />

           <Route path='/payment' element={<PaymentPage/>}/>
           <Route path='/payment/success' element={<PaymentSuccess/>}/>
            <Route path="/payment/failure" element={<PaymentFailure />} />
            <Route path="/payment/status" element={<PaymentStatus />} />
      </Routes>
    

    </Router>
    
  )
}

export default App