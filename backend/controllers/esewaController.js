import EsewaService from "../services/esewaService.js";
import Transaction from "../models/Transaction.js";
import {Buffer} from 'buffer';


class EsewaController{
    static async initiatePayment(req,res){
        try{
            const{
                clientId,
                serviceId,
                technicianId,
                bookingId,
                amount,
                taxAmount,
                serviceCharge,
                deliveryCharge
            }=req.body;

            // Validate required fields
            if(!clientId || !serviceId || !technicianId || !amount || !bookingId){
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }
            const paymentData= await EsewaService.createPaymentRequest({
                clientId,
                serviceId,
                technicianId,
                bookingId,
                amount,
                taxAmount,
                serviceCharge,
                deliveryCharge
            });
            res.json({
                success: true,
                message:'Payment request created successfully',
                data: paymentData
            });
            
        }catch (error){
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async handleSuccessCallback(req,res){
        try {
            const {data}= req.query;
            if(!data){
                return res.status(400).json({
                    success: false,
                    message: 'No payment data received'
                });
            }
            // Decode Base64 response
            const decodedData= Buffer.from(data, 'base64').toString('utf-8');
            const responseData= JSON.parse(decodedData);
            // verify payment
            const verificationResult= await EsewaService.verifyPaymentResponse(responseData);
            if(verificationResult.success){
                res.json({
                    success: true,
                    message: 'Payment verified successfully',
                    transaction: verificationResult.transaction
                });
            }else{
                res.status(400).json({
                    success: false,
                    message: 'payment verification failed'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
            
        }
    }

    static async handleFailureCallback(req,res){
        try {
           const {transaction_uuid}= req.query;
           if(transaction_uuid){
            await Transaction.findOneAndUpdate(
                {transaction_uuid},
                {status: 'FAILED'}
            );
           } 
           res.json({
            success: false,
            message: 'Payment failed or cancelled'
           });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    static async getTransaction(req,res){
        try {
         const {transaction_uuid}= req.params;
         const transaction= await EsewaService.getTransactionById(transaction_uuid);
         res.json({
            success: true,
            message: 'Transaction retrieved successfully',
            data: transaction
         });   
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
            
        }
    }
     static async checkPaymentStatus(req, res) {
    try {
      const { transaction_uuid } = req.params;

      if (!transaction_uuid) {
        return res.status(400).json({
          success: false,
          message: "Transaction UUID is required",
        });
      }

      const statusResult = await EsewaService.checkPaymentStatus(transaction_uuid);

      res.json({
        success: true,
        message: "Payment status retrieved successfully",
        data: statusResult,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

};
export default EsewaController;