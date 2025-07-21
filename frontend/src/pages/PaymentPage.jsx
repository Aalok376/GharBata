import { ArrowLeft } from 'lucide-react';
import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom'
import PaymentForm from '../components/PaymentForm';

const PaymentPage = () => {
    const location = useLocation();
    const navigate= useNavigate();
    const {serviceData, technicianData, retryData}= location.state || {};

    // Mock data for demonstration
    const mockServiceData= serviceData || {
        id:'60f7b3b3b3b3b3b3b3b3b3b3',
        name:'AC Repair Service',
        description: 'Professional AC repair and maintenance',
        basePrice: 1500,
        clientId:'60f7b3b3b3b3b3b3b3b3b3b4' 
    };
    const mockTechnicianData= technicianData || {
       id: '60f7b3b3b3b3b3b3b3b3b3b5',
    name: 'John Doe',
    phone: '+977-9841234567',
    email: 'john@example.com' 
    };

    const handlePaymentSuccess = (paymentData)=>{
        // handle successful payment initiation
        console.log('Payment initiated:',paymentData);
    };
    if(!serviceData && !retryData){
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <h2 className='text-2xl font-bold text-gray-800 mb-4'>No Service Selected</h2>
                    <p className='text-gray-600 mb-6'>Please select a service to continue with payment</p>
                    <button 
                    onClick={()=> navigate('/services')}
                    className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                        Browse Services
                    </button>
                </div>
            </div>
        );
    }

  return (
  <div className='min-h-screen bg-gray-50 py-8'>
    <div className='max-w-4xl mx-auto px-4'>

        {/* Header */}
        <div className='mb-6'>
        <button 
        onClick={()=> navigate(-1)}
        className='flex items-center text-gray-600 hover:text-gray-800 mb-4'>
            <ArrowLeft className='mr-2 h-4 w-4'/>
            Back 
        </button>
        <h1 className='text-3xl font-bold text-gray-800'>Complete Payment </h1>
        <p className='text-gray-600 mt-2'>Secure payment processing through eSewa </p>
    </div>

    {/* Payment Form */}
    <PaymentForm
    serviceData={mockServiceData}
    technicianData={mockTechnicianData}
    onPaymentSuccess={handlePaymentSuccess}
    />
  </div>
  </div>
    
  );
};

export default PaymentPage;