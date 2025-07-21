import React, { useEffect, useState } from 'react'
import EsewaService from '../services/esewaService';
import { CheckCircle, Download,ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import {useSearchParams, useNavigate} from 'react-router-dom';

const PaymentSuccess = () => {
    const [searchParams]= useSearchParams();
    const navigate= useNavigate();
    const[ transaction, setTransaction]= useState(null);
    const [loading, setLoading]= useState(true);

    useEffect(()=>{
        const verifyPayment= async () => {
            try {
                const responseData= searchParams.get('data');
                if(responseData){
                    const result= await EsewaService.verifyPayment(responseData);
                    setTransaction(result.transaction);
                    toast.success('Payment verified successfully !');
                }
            } catch (error) {
                toast.error('Payment verification failed');
                navigate('/payment/failure');
                
            }finally{
                setLoading(false);
            }
        };
        verifyPayment();
    },[searchParams, navigate]);
    if(loading){
        return(
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full w-12 h-12 border-b-2 border-grren-600 mx-auto mb-4'></div>
                    <p className='text-gray-400'>Verifying payment...</p>
                </div>
            </div>
        );
    }
  return (
    <div className='min-h-screen bg-gray-50 py-8'>
        <div className='max-w-2xl mx-auto px-4'>
            <div className='bg-white rounded-lg shadow-lg overflow-hidden'>

                {/*Success Header */}
                <div className='bg-green-600 px-6 py-8 text-center'>
                    <CheckCircle className='mx-auto h-16 w-16 text-white mb-4'/>
                    <h1 className='text-3xl font-bold text-white mb-2'>Payment Successful!</h1>
                    <p className='text-green-100'>Your payment has been processed successfully</p>
                </div>

                {/*Transaction Details */}
                {transaction && (
                    <div className='px-6 py-8'>
                        <div className='grid gap-6'>
                            <div>
                                <h2 className='text-xl font-semibold text-gray-800 mb-4'>Transaction Details</h2>
                                <div className='bg-gray-50 rounded-lg p-4 space-y-3'>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>Transaction ID:</span>
                                        <span className='font-mono text-sm'>{transaction.transaction_uuid}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>Amount</span>
                                        <span className='font-semibold'>NPR {transaction.amount.toLocaleString()}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>Tax:</span>
                                        <span>NPR {transaction.tax_amount.toLocaleString()}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>Service Charge:</span>
                                        <span>NPR {transaction.service_charge.toLocaleString()}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>Delivery Charge:</span>
                                        <span>NPR {transaction.delivery_charge.toLocaleString()}</span>
                                    </div>
                                    <hr className='my-2'/>

                                    <div className='flex justify-between text-lg font-semibold'>
                                        <span className='text-gray-800'>Total Amount</span>
                                        <span className='text-green-600'>NPR {transaction.total_amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className='text-lg font-semibold text-gray-800 mb-3'>Service Information</h3>
                                <div className='bg-blue-50 rounded-lg p-4'>
                                    <p className='text-blue-800 font-medium'>{transaction.service_id?.name}</p>
                                    <p className='text-blue-600 text-sm'>{transaction.service_id?.description}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className='text-lg font-semibold text-gray-800 mb-3'>Technician Information</h3>
                                <div className='bg-purple-50 rounded-lg p-4'>
                                    <p className='text-purple-800 font-medium'>{transaction.technician_id?.name}</p>
                                    <p className='text-purple-600 text-sm'>{transaction.technician_id?.phone}</p>
                                </div>
                            </div>
                        </div>

                        {/*Action Buttons */}
                        <div className='mt-8 flex gap-4'>
                            <button onClick={()=> window.print()}
                            className='flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'>
                                <Download className='mr-2 h-4 w-4'/>
                                Download Receipt
                            </button>
                            <button onClick={()=>
                                navigate('/dashboard')
                            }
                            className='flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'>
                                Go to Dashboard
                                <ArrowRight className="mt-2 h-4 w-4"/>
                            </button>                     
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
    
  );
};

export default PaymentSuccess;