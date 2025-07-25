import Booking from "../models/Booking.js";
import EsewaService from "../services/esewaServicessQ.js";
import Transaction from "../models/Transaction.js";
import {Buffer} from 'buffer';


class EsewaController{
    static async initiatePayment(req,res){
          console.log(" initiatePayment controller hit"); // <== Log this
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
            
    console.log("Payment request body:", req.body); // <== Log body

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
               
      const formHtml =` 
     <html>
  <body onload="document.forms['esewaForm'].submit()">
    <form id="esewaForm" name="esewaForm" action="${paymentData.payment_url}" method="POST">
      <input type="hidden" name="amount" value="${paymentData.amount}" />
      <input type="hidden" name="tax_amount" value="${paymentData.tax_amount}" />
      <input type="hidden" name="total_amount" value="${paymentData.total_amount}" />
      <input type="hidden" name="transaction_uuid" value="${paymentData.transaction_uuid}" />
      <input type="hidden" name="product_code" value="${paymentData.product_code}" />
      <input type="hidden" name="product_service_charge" value="${paymentData.product_service_charge}" />
      <input type="hidden" name="product_delivery_charge" value="${paymentData.product_delivery_charge}" />
      <input type="hidden" name="success_url" value="${paymentData.success_url}" />
      <input type="hidden" name="failure_url" value="${paymentData.failure_url}" />
    </form>
      </body>
      </html>`;
      //send html form to browser
      res.send(formHtml);
            
        }catch (error){
         console.error(" initiatePayment error:", error.message);      
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
                const transaction= verificationResult.transaction;
                await Booking.findByIdAndUpdate(transaction.booking_id,{
                    paymentStatus:'COMPLETE',
                });
                res.redirect(`${process.env.FRONTEND_URL}/payment/success?data=${data}`);
            }else{
                res.redirect(`${process.env.FRONTEND_URL}/payment/failure?transaction_uuid=${responseData.transaction_uuid}`);
            }
        }catch(error){
             console.error("❌ handleSuccessCallback error:", error.message);
      res.status(500).send("Payment verification failed.");
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
       
      res.redirect(`${process.env.FRONTEND_URL}/payment/failure?transaction_uuid=${transaction_uuid}`);

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