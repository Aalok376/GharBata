const esewaConfig= {
    development:{
        secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
        productCode: process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST',
        paymentUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
         statusUrl: 'https://rc.esewa.com.np/api/epay/transaction/status/',
         testToken: '123456'

    },
    production:{
         secretKey: process.env.ESEWA_SECRET_KEY_PROD,
         productCode: process.env.ESEWA_PRODUCT_CODE_PROD,
         paymentUrl: 'https://epay.esewa.com.np/api/epay/main/v2/form',
         statusUrl: 'https://epay.esewa.com.np/api/epay/transaction/status/',
         testToken: null

    }
};
const currentConfig= esewaConfig[process.env.NODE_ENV || 'development'];
export default currentConfig;