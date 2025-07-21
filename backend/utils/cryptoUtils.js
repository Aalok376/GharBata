import CryptoJS from 'crypto-js';
class CryptoUtils{
    static generateHMACSignature(message, secretKey){
        try {
           const hash= CryptoJS.HmacSHA256(message, secretKey);
           return CryptoJS.enc.Base64.stringify(hash); 
        } catch (error) {
            throw new Error('Error generating signature:' + error.message);
            
        }
    }
     static verifySignature(message, signature, secretKey){
        try {
            const expectedSignature= this.generateHMACSignature(message,secretKey);
            return expectedSignature === signature;
        } catch (error) {
            return false;
            
        }
     }
     static createSignedFieldNames(fields){
        return fields.join(',');
     }
}
export default CryptoUtils;
