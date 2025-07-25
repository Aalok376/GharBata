import axios from 'axios';
import {v4 as uuidv4} from 'uuid';
import CryptoUtils from '../utils/cryptoUtils.js';
import Transaction from '../models/Transaction.js';
import esewaConfig from '../config/esewaConfig.js';


class EsewaService{
    
    static async createPaymentRequest(paymentData){
        console.log(" EsewaService.createPaymentRequest called");
console.log(" Payment data received:", paymentData);
        try{
            const{
                clientId,
                technicianId,
                serviceId,
                bookingId,
                amount,
                taxAmount=0,
                serviceCharge= 0,
                deliveryCharge= 0
            }= paymentData;
            // Calculate total amount
            const totalAmount=amount + taxAmount + serviceCharge + deliveryCharge;
                  // Generate unique transaction UUID
            const transactionUuid= `${Date.now()}-${uuidv4().substring(0,8)}`;

 // Create signed field names
            const signedFieldNames= CryptoUtils.createSignedFieldNames([
                'total_amount',
                'transaction_uuid',
                'product_code'
            ]);
            
      // Create signature message
            const signatureMessage=`total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${esewaConfig.productCode}`;
// Generate signature
            const signature= CryptoUtils.generateHMACSignature(signatureMessage, esewaConfig.secretKey);

// Create transaction record
            const transaction= new Transaction({
                transaction_uuid: transactionUuid,
                client_id: clientId,
                service_id: serviceId,
                technician_id: technicianId,
                booking_id: bookingId,
                amount: amount,
                tax_amount: taxAmount,
                service_charge: serviceCharge,
                delivery_charge: deliveryCharge,
                total_amount: totalAmount,
                product_code: esewaConfig.productCode,
                signature: signature,
                status: 'PENDING'

            });
            await transaction.save();

            //  Log everything BEFORE return
 console.log(' Esewa Config:', esewaConfig);
console.log(' Payment URL:', esewaConfig.paymentUrl);
console.log(' Constructed Payment Response Payload:', {
  transaction_uuid: transactionUuid,
  amount: amount,
  tax_amount: taxAmount,
  total_amount: totalAmount,
  product_code: esewaConfig.productCode,
  product_service_charge: serviceCharge,
  product_delivery_charge: deliveryCharge,
  success_url: `${process.env.FRONTEND_URL}/payment/success`,
  failure_url: `${process.env.FRONTEND_URL}/payment/failure`,
  signed_field_names: signedFieldNames,
  signature: signature,
  payment_url: esewaConfig.paymentUrl
});

             // Return payment form data
            return{
                transaction_uuid: transactionUuid,
                amount: amount,
                tax_amount: taxAmount,
                total_amount: totalAmount,
                product_code: esewaConfig.productCode,
                product_service_charge: serviceCharge,
                product_delivery_charge: deliveryCharge,
                success_url: `${process.env.FRONTEND_URL}/payment/success`,
                failure_url: `${process.env.FRONTEND_URL}/payment/failure`,
                signed_field_names: signedFieldNames,
                signature: signature,
                payment_url: esewaConfig.paymentUrl
            };
        }catch(error){
            throw new Error('Error creating payment request:' + error.message);
        }
        }

        static async verifyPaymentResponse(responseData){
            try{
                const{
                    transaction_code,
                    status,
                    total_amount,
                    transaction_uuid,
                    product_code,
                    signed_field_names,
                    signature
                }= responseData;
                 // Find transaction
                const transaction=await Transaction.findOne({transaction_uuid});
                if(!transaction){
                    throw new Error('Transaction not found');
                }

                
      // Create signature message for verification
                const signatureMessage= `transaction_code=${transaction_code},status=${status}, total_amount=${total_amount}, transaction_uuid=${transaction_uuid},product_code=${product_code}, signed_field_names=${signed_field_names}`;

                
      // Verify signature
                const isValidSignature= CryptoUtils.verifySignature(
                    signatureMessage,
                    signature,
                    esewaConfig.secretKey
                );
                if(!isValidSignature){
                    throw new Error('Invalid signature');
                }
                 // Update transaction
                transaction.status= status;
                transaction.transaction_code= transaction_code;
                transaction.response_signature= signature;
                await transaction.save();

                return {
                    success: true,
                    transaction: transaction,
                    verified: true
                };
            }catch(error){
                throw new Error('Error verifying payment:' + error.message);
            }
        }
        static async checkPaymentStatus(transactionUuid){
            try {
                const transaction= await Transaction.findOne({transaction_uuid: transactionUuid});
                if(!transaction){
                    throw new Error('Transaction not found');
                }

                const statusUrl=`${esewaConfig.statusUrl}?product_code=${transaction.product_code}&total_amount=${transaction.total_amount}&transaction_uuid=${transactionUuid}`;
                const response= await axios.get(statusUrl);
                const statusData= response.data;
// Update transaction status
                if(statusData.status){
                    transaction.status= statusData.status;
                    transaction.esewa_ref_id= statusData.ref_id;
                    await transaction.save();
                }
                return {
                     success: true,
                     status: statusData.status,
                     transaction: transaction
                };

            }catch(error){
                throw new Error('Error checking payment status:' + error.message);
            }
        }

        static async getTransactionById(transactionUuid){
            try {
                const transaction= await Transaction.findOne({transaction_uuid: transactionUuid})
                .populate('client_id', 'name username')
                .populate('service_id', 'name description')
                .populate('technician_id', 'name username contactNumber');

                if(!transaction){
                    throw new Error('Transaction not found');
                }
                return transaction;

            } catch (error){
                throw new Error('Error fetching transaction:' + error.message);

            }
        }
    }
    export default EsewaService;
