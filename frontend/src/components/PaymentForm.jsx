import React, {useEffect, useRef, useState} from 'react';
import { useForm } from 'react-hook-form'
import { CreditCard, User, Wrench, DollarSign, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEsewaPayment } from '../hooks/useEsewaPayment';

const PaymentForm=({ serviceData, technicianData,onPaymentSuccess})=>{
    const {register,handleSubmit, watch, formState: {errors}}= useForm();
    const {loading, initiatePayment}= useEsewaPayment();
    const [calculating, setCalculating]= useState(false);
    // holds the payment data from backend after initiation
    const [paymentData,setPaymentData]= useState(null);
    // form ref for auto-submit to Esewa
    const formRef= useRef();

    const amount= watch('amount') || serviceData?.basePrice || 0;
    const taxAmount= watch('taxAmount') || 0;
    const serviceCharge= watch('serviceCharge') || 0;
    const deliveryCharge= watch('deliveryCharge') || 0;

    const totalAmount= Number(amount) + Number(taxAmount) + Number(serviceCharge) + Number(deliveryCharge);

    const onSubmit= async (data) => {
        try {
            setCalculating(true);

            const paymentData={
                clientId: data.clientId,
                serviceId: serviceData.id,
                technicianId: technicianData.id,
                amount: Number(data.amount),
                taxAmount: Number(data.taxAmount) || 0,
                serviceCharge: Number(data.serviceCharge) || 0,
                deliveryCharge: Number(data.deliveryCharge) || 0

            };
            // call backend to initiate payment and get eSewa payment details
            const response= await initiatePayment(paymentData);
            setPaymentData(response); // save payment details
            toast.success('Redirecting to eSewa...');
            if(onPaymentSuccess){
                onPaymentSuccess(response);
            }
        } catch (error) {
            toast.error('Failed to initiate payment');
            
        }finally {
            setCalculating(false);
        }
        
    };
   
// otherwise show normal payment form input
    return (
        <div className='max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg'>
            <div className='mb-6'>
                <h2 className='text-2xl font-bold text-gray-800 mb-2 flex items-center'>
                    <CreditCard className='mr-2 text-blue-600' />
                    Payment Details
                </h2>
                <p className='text-gray-600'>Complete your service payment through eSewa</p>
            </div>

            {/* Service and technician Info*/}
            <div className='grid md:grid-cols-2 gap-4 mb-6'>
                <div className='bg-gray-50 p-4 rounded-lg'>
                    <h3 className='font-semibold text-gray-700 mb-2 flex items-center'>
                        <Wrench className="mr-2 text-green-600" size={16}/>
                        Service Details
                    </h3>
                    <p className='text-sm text-gray-600'>{serviceData?.name}</p>
                    <p className='text-sm text-gray-500'>{serviceData?.description}</p>
                </div>

                <div className='bg-gray-50 p-4 rounded-lg'>
                    <h3 className='font-semibold text-gray-700 mb-2 flex items-center'>
                        <User className="mr-2 text-blue-600" size={16}/>
                        Technician
                    </h3>
                    <p className='text-sm text-gray-600'>{technicianData?.name}</p>
                    <p className='text-sm text-gray-500'>{technicianData?.phone}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                {/*Hidden Client ID */}
                <input type='hidden' 
                {...register('clientId',{required: true})}
                value={serviceData?.clientId || ''} />

                {/* Amount */}
                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Service Amount (NPR)
                    </label>
                    <div className='relative'>
                        <DollarSign className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input type='number'
                        {...register('amount',{
                            required: 'Amount is required',
                            min: {value: 1, message: 'Amount must be greater than 0'}
                        })}
                        className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='Enter service amount'
                        defaultValue={serviceData?.basePrice || ''}
                        />
                    </div>
                    {errors.amount && (
                        <p className='mt-1 text-sm text-red-600'>{errors.amount.message}</p>

                    )}
                    </div>
                    {/* Tax Amount */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Tax Amount (NPR)
                        </label>
                        <input type='number'
                        {...register('taxAmount')}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder="Enter tax amount (optional)"
                        defaultValue={0}
                        />
                    </div>

                    {/*Service Charge */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Service Charge (NPR)
                        </label>
                        <input
                        type="number"
                        {...register('serviceCharge')}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='Enter service charge (optional)'
                        defaultValue={0}
                        />
                    </div>
                    {/* Delivery Charge */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Delivery Charge (NPR)
                        </label>
                        <input
                        type="number"
                        {...register('deliveryCharge')}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='Enter delivery charge (optional)'
                        defaultValue={0}
                        />
                    </div>

                    {/*Total Amount Display*/}
                    <div className='bg-blue-50 p-4 rounded-lg'>
                        <div className='flex items-center justify-between'>
                            <span className='text-lg font-semibold text-gray-700 flex items-center'>
                                <Calculator className="mr-2 text-blue-600" size={20}/>
                                Total Amount:
                            </span>
                            <span className='text-2xl font-bold text-blue-600'>
                                NPR {totalAmount.toLocaleString()}
                            </span>
                        </div>
                    </div>
                    {/* Payment Method Info */}
                    <div className='bg-green-50 p-4 rounded-lg'>
                        <h3 className='font-semibold text-gray-700 mb-2'>Payment Method: eSewa</h3>
                        <p className='text-sm text-gray-600'>
                            You will be redirected to eSewa to complete the payment securely.
                        </p>
                        <p className='text-sm text-gray-500 mt-1'>
                            Test Token: 123456 (for testing purpose)
                        </p>
                    </div>

                    {/*Submit Button */}
                    <button type='submit'
                    disabled={loading || calculating}
                    className={`w-full py-4 x-4 rounded-lg font-semibold text-white transaction-colors ${ loading || calculating
                        ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500'

                    }`}>
                        {loading || calculating ? (
                            <span className='flex items-center justify-center'>
                                <svg className='animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24'>
                                <circle className='opacity-25' cx="12" cy="12" r="10" stroke='currentColor' strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
                            Processing...
                            </span>
                        ):(
                            `pay NPR ${totalAmount.toLocaleString()} with eSewa`
                        )}
                    </button>
            </form>
        </div>
    );
};
export default PaymentForm;