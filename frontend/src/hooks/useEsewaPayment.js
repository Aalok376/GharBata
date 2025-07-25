import { useState, useCallback } from "react";
import EsewaService from "../services/esewaService";
import toast from 'react-hot-toast';

export const useEsewaPayment=()=>{
    const [loading, setLoading]= useState(false);
    const [error, setError]= useState(null);
    const [paymentData, setPaymentData]= useState(null);

    const initiatePayment= useCallback(async(paymentDetails)=>{
        setLoading(true);
        setError(null);
        try {
           const response= await EsewaService.initiatePayment(paymentDetails);
           if(response.success && response.data){
           setPaymentData(response.data);
           submitToEsewa(response.data); // auto submit to eSewa
           }else{
            throw new Error("Failed to initiate payment");
           }
           return response;
        }catch(err){
            setError(err.message);
            toast.error(err.message);
            throw err;
        } finally{
            setLoading(false);
        }
        },[]);
           
    const submitToEsewa= useCallback((formData)=>{
        // create form and submit to eSewa
        const form= document.createElement('form');
        form.method= 'POST';
        form.action= formData.payment_url;
        form.style.display= "none";

        // Add all form fields
        const fields=[
            'amount',
            'tax_amount',
            'total_amount',
            'transaction_uuid',
            'product_code',
            'product_service_charge',
            'product_delivery_charge',
            'success_url',
            'failure_url',
            'signed_field_names',
            'signature'
                ];
                fields.forEach(field=>{
                    const input= document.createElement('input');
                    input.type= 'hidden';
                    input.name= field;
                    input.value= formData[field] || '';
                    form.appendChild(input);
                });
                document.body.appendChild(form);
                form.submit();
    },[]);

    const checkPaymentStatus = useCallback(async (transaction_uuid)=>{
        setLoading(true);
        setError(null);

        try {
            const response= await EsewaService.checkPaymentStatus(transaction_uuid);
            return response;
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
            throw err;
            
        } finally {
            setLoading(false);
        }

    },[]);
    return {
        loading,
        error,
        paymentData,
        initiatePayment,
        checkPaymentStatus
    };
};
