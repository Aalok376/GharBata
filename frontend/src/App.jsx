import React from 'react';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import Client_Login from './pages/Client_Login';
import Client_Signup from './pages/Client_Signup';
import Technician_Signup from './pages/Technician_Signup';
import Technician_Login from './pages/Technician_Login';
import Navbar from './components/Navbar';



function App(){
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path='/client_login' element={<Client_Login/>}/>
        <Route path='/client_signup' element={<Client_Signup/>}/>
        <Route path='/technician_login' element={<Technician_Login/>}/>
        <Route path='/technician_signup' element={<Technician_Signup/>}/>
        
  
      </Routes>

    </Router>
    
  );
}

export default App;