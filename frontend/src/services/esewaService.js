import axios from 'axios';
const BASE_URL='http://localhost:5000'
class EsewaService{
    static async initiatePayment(paymentData){
       try {
        const response= await axios.post(`${BASE_URL}/api/payment/esewa/initiate`,paymentData);
        return response.data;
       } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to initiate payment');
       } 
    }
    static async checkPaymentStatus(transactionUuid){
        try {
          const response=await axios.get(`${BASE_URL}/api/payment/esewa/status/${transactionUuid}`);
          return response.data;  
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to check payment status');
        }
    }
    static async getTransaction(transactionUuid){
        try {
            const response= await axios.get(`${BASE_URL}/api/payment/esewa/transaction/${transactionUuid}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to get transaction');

        }
    }
    static async verifyPayment(responseData){
        try {
           const response= await axios.get(`${BASE_URL}/api/payment/esewa/success`,{
            params: {data: responseData}
           });
           return response.data; 
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to verify payment');
            
        }
    }

}
export default EsewaService;