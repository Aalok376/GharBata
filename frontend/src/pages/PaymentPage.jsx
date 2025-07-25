import { ArrowLeft } from 'lucide-react';
import React, { useEffect } from 'react';
import {useLocation, useNavigate} from 'react-router-dom'
import PaymentForm from '../components/PaymentForm';
import axios from 'axios';
const PaymentPage = () => {
    const {state} = useLocation();
    const navigate= useNavigate();
    const bookingId= state?.bookingId;
    const amount=state?.amount;

    useEffect(()=>{
        const initiateEsewaPayment= async()=>{
            try{
                const response= await axios.post('http://localhost:5000/api/esewa/initiate',{
                    bookingId,
                    amount,
                },{
                  responseType: 'text'// Important: expect plain HTML text response
                
            });
            const formHtml= response.data;
            //open a new window
            const newWindow= window.open("",'_blank','width=600, height=700');
            if(newWindow){
               // Write the HTML form to the new window and close the document to render it
          newWindow.document.open();
          newWindow.document.write(formHtml);
          newWindow.document.close();
            }else{
               alert('Please allow popups for this site to complete payment');
          navigate('/payment/failure');
            }
          } catch(error){
                   console.error('Esewa initiation failed:', error);
        navigate('/payment/failure');

          }
        };
      
        if(bookingId && amount){
            initiateEsewaPayment();
        }else{
            navigate('/payment/failure');
        }
    },[bookingId,amount,navigate]);


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-800 absolute top-6 left-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </button>
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Redirecting to eSewa...</h2>
        <p className="text-gray-600">Please wait while we redirect you to complete the payment.</p>
      </div>
    </div>
    
  );
};

export default PaymentPage;