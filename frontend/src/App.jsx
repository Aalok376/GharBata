import React, { useEffect, useState } from 'react';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'


import Client_Login from './pages/Client_Login'
import Client_Signup from './pages/Client_Signup'
import Technician_Signup from './pages/Technician_Signup'
import Technician_Login from './pages/Technician_Login'
import HomePageFunc from './pages/IntroductionPage'
import ProfessionalPage from './pages/professionalHomePage'
import ClientPage from './pages/clientHomePage'
import Overlay_Otp from './components/otpOverlay'
import Chat from './components/chatBox'
import { status } from './api/auth'



function App(){
  
  // State to hold server status message
  // This will be used to display server status on the console of browser
  // This is for debugging purposes
  const [serverMessage, setServerMessage] = useState("");
  useEffect(() => {
    const checkServer = async () => {
      const result = await status();
      setServerMessage(result.message || result); // handle both object or string
      console.log("Backend status:", result);
    };
    checkServer();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePageFunc/>}/>
        <Route path='/home' element={<HomePageFunc/>}/>
        <Route path='/dashboard' element={<ClientPage/>}/>
        <Route path='/client_login' element={<Client_Login/>}/>
        <Route path='/client_signup' element={<Client_Signup/>}/>
        <Route path='/technician_login' element={<Technician_Login/>}/>
        <Route path='/technician_signup' element={<Technician_Signup/>}/>
        <Route path='/otp' element={<Overlay_Otp/>}/>
        <Route path='/professional' element={<ProfessionalPage/>}/>
        <Route path='/chat/:bookingId' element={<Chat/>}/>
      </Routes>
    

    </Router>
    
  );
}

export default App;