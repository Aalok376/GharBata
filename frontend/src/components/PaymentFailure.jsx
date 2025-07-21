import React, {useEffect, useState} from 'react';
import { useNavigate,useSearchParams } from 'react-router-dom';
import EsewaService from '../services/esewaService';
import { RefreshCw,ArrowLeft, XCircle } from 'lucide-react';

const PaymentFailure = ()=>{
    const [searchParams]= useSearchParams();
    const navigate= useNavigate();
    const [transaction, setTransaction]= useState(null);
    const [loading, setLoading]= useState(true);

    useEffect(()=>{
        const checkTransaction= async()=>{
            try {
                const transactionUuid= searchParams.get('transaction_uuid');
                if(transactionUuid){
                    const result= await EsewaService.getTransaction(transactionUuid);
                    setTransaction(result.data);
                }
            } catch (error) {
                console.error('Error fetching transaction:',error);
                
            }finally {
                setLoading(false);
            }
        };
        checkTransaction();
        
    },[searchParams]);
    const handleRetryPayment=()=>{
        if(transaction){
            navigate('/payment',{state:{
                serviceData: transaction.service_id,
                technicianData: transaction.technician_id,
                retryData: transaction
            }}
            );
        }else{
            navigate('/services');
        }
    };
    if(loading){
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4'></div>
                    <p className='text-gray-600'>Loading transaction details...</p>
                </div>
            </div>
        );
    }
    return(
        <div className='min-h-screen bg-gray-50 py-8'>
            <div className='max-w-2xl mx-auto px-4'>
                <div className='bg-white rounded-lg shadow-lg overflow-hidden'>

                    {/*Failure Header */}
                    <div className='bg-red-600 px-6 py-8 text-center'>
                        <XCircle className='mx-auto h-16 w-16 text-white mb-4'/>
                        <h1 className='text-3xl font-bold text-white mb-2'>Payment Failed</h1>
                        <p className='text-red-100'>Your payment could not be processed</p>
                    </div>
                    <div className='px-6 py-6'>
                        <div className='text-center mb-8'>
                            <h2 className='text-xl font-semibold text-gray-800 mb-2'>What Happened</h2>
                            <p className='text-gray-600'>
                                Your payment was either cancelled or failed due to technical issues.
                                Don't worry, no money has been deducted from your account.
                            </p>
                        </div>
                        {/*Transaction Details (if available) */}
                        {transaction && (
                            <div className='mb-8'>
                                <h3 className='text-lg font-semibold text-gray-800 mb-4'>Transaction Details</h3>
                                <div className='bg-gray-50 rounded-lg p-4 space-y-3'>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600'>Transaction ID:</span>
                                        <span className='font-mono text-sm'>{transaction.transaction_uuid}</span>
                                    </div>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>Amount</span>
                                    <span className='font-semibold'>NPR {transaction.total_amount.toLocaleString()}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>Status</span>
                                    <span className='pc-2 py-1 bg-red-100 text-red-800 rounded-full text-sm'>{transaction.status}</span>
                                </div>
                                </div>
                            </div>
                        )}

                        {/*Possible Reasons */}
                        <div className='mb-8'>
                            <h3 className='text-lg font-semibold text-gray-800 mb-4'>Possible Reasons</h3>
                            <ul className='space-y-2 text-gray-600'>
                                <li className='flex items-start'>
                                    <span className='inline-block w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0'></span>
                                    Payment was cancelled by user 
                                </li>
                                <li className='flex items-start'>
                                    <span className='inline-block w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0'></span>
                                    Insufficient balance in eSewa account
                                </li>
                                <li className='flex items-start'>
                                    <span className='inline-block w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0'></span>
                                    Techncial issues with payment gateway
                                </li>
                                <li className='flex items-start'>
                                    <span className='inline-block w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0'></span>
                                    Network connection problems
                                </li>
                            </ul>
                        </div>

                        {/* Action buttons */}
                        <div className='flex gap-4'>
                            <button onClick={()=> navigate('/services')}
                            className='flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'>
                                <ArrowLeft className="mr-2 h-4 w-4"/>
                                Back to Services
                            </button>
                            <button onClick={handleRetryPayment}
                            className='flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'>
                                <RefreshCw className='mr-2 h-4 w-4'/>
                                Retry Payment 
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default PaymentFailure;