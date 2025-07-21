import React, { useState } from 'react'
import { useEsewaPayment } from '../hooks/useEsewaPayment';
import { CheckCircle, Clock, Search, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
const PaymentStatus = () => {
 
    const [transactionId, setTransactionId]= useState('');
    const [transaction, setTransaction]= useState(null);
    const {loading, checkPaymentStatus}= useEsewaPayment();

    const handleCheckStatus= async(e)=>{
        e.preventDefault();
        if(!transactionId.trim()){
            toast.error('Please enter a transaction ID:');
            return;
        }
        try {
            const result= await checkPaymentStatus(transactionId);
            setTransaction(result.data.transaction);
            toast.success('Status retrieved successfully');
            
        } catch (error) {
            toast.error('Failed to retrieve status');
            
        }
    };

    const getStatusIcon= (status)=>{
        switch(status){
            case 'COMPLETE':
                return <CheckCircle className='h-5 w-5 text-green-500'/>;
                case 'FAILED':
                    return <XCircle className='h-5 w-5 text-red-500'/>;
                    case 'PENDING':
                        return <Clock className='h-5 w-5 text-yellow-500'/>;
                        default:
                            return <Clock className='h-5 w-5 text-gray-500'/>;
        }
    };

    const getStatusColor= (status)=>{
        switch(status){
             case 'COMPLETE':
        return 'text-green-600 bg-green-100';
      case 'FAILED':
        return 'text-red-600 bg-red-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';

        }

    };
    
     return (
        <div className='max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg'>
            <div className='mb-6'>
                <h2 className='text-2xl font-bold text-gray-800 mb-2 flex items-center'>
                    <Search className='mr-2 text-blue-600'/>
                    Payment Status Check 
                </h2>
                <p className='text-gray-600'>Check the status of your payment transaction </p>
            </div>

            {/*Search form */}
            <form onSubmit={handleCheckStatus} className=''>
                <div className='flex gap-2'>
                    <input type='text' 
                    value={transactionId}
                    onChange={(e)=> setTransactionId(e.target.value)}
                    placeholder='Enter transaction ID'
                    className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'/>
                    <button
                     type="submit"
                    disabled={loading}
                    className={`px-6 py-2 rounded-lg font-semibold text-white transition-colors ${
                        loading? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                    }`} >
                        {loading ? 'Checking...': 'Check Status' }
                    </button>
                </div>
            </form>

            {/* Transaction Details */}
            {transaction && (
                <div className='bg-gray-50 rounded-lg p-6'>
                    <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-800'>Transaction Details</h3>
                        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span className='mt-2'>{transaction.status}</span>
                        </div>
                    </div>

                    <div className='space-y-3'>
                        <div className='flex justify-between'>
                            <span className='text-gray-600'>Transition ID:</span>
                            <span className='font-mono text-sm'>{transaction.transaction_uuid}</span>
                        </div>

                        {transaction.transaction_code && (
                            <div className='flex justify-between'>
                                <span className='text-gray-600'>eSewa Transaction Code:</span>
                                <span className='font-mono text-sm'>{transaction.transaction_code}</span>
                            </div>
                        )}

                        <div className='flex justify-between'>
                            <span className='text-gray-600'>Amount</span>
                            <span className='font-semibold'>NPR {transaction.total_amount.toLocaleString()}</span>
                        </div>

                        <div className='flex justify-between'>
                            <span className='text-gray-600'>Payment Method:</span>
                            <span>{transaction.payment_method}</span>
                        </div>
                        

                        <div className='flex justify-between'>
                            <span className='text-gray-600'>Created</span>
                            <span>{new Date(transaction.createdAt).toLocaleString()}</span>
                        </div>

                        {transaction.updatedAt  !== transaction.createdAt && (
                            <div className='flex justify-between'>
                                <span className='text-gray-600'>Last Updated:</span>
                                <span>{new Date(transaction.updatedAt).toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {/* Service and Technician Info */}
                    {transaction.service_id && (
                        <div className='mt-4 pt-4 border-t'>
                            <h4 className='font-semibold text-gray-700 mb-2'>Service Information</h4>
                            <p className='text-gray-600'>{transaction.service_id.name}</p>
                            <p className='text-gray-500 text-sm'>{transaction.service_id.description}</p>
                        </div>
                    )}

                    {transaction.technician_id && (
                        <div className='mt-4 pt-4 border-t'>
                            <h4 className='font-semibold text-gray-700 mb-2'>Technician Information</h4>
                            <p className='text-gray-600'>{transaction.technician_id.name}</p>
                            <p className='text-gray-500 text-sm'>{transaction.technician_id.phone}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
  );
};

export default PaymentStatus;