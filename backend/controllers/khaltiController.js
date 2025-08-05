import axios from 'axios'
import Payment from '../models/payment.js'
import User from '../models/user.js'
import client from '../models/client.js'
import technician from '../models/technician.js'

// Environment-based configuration
const NODE_ENV = process.env.NODE_ENV || 'development'
const isProduction = NODE_ENV === 'production'

console.log('KHALTI_LIVE_SECRET_KEY env variable:', process.env.KHALTI_LIVE_SECRET_KEY ? 'Present' : 'Missing or Empty')
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY

// Use appropriate base URL based on environment
const KHALTI_BASE_URL = isProduction
    ? 'https://khalti.com/api/v2/'
    : 'https://dev.khalti.com/api/v2/'

// Log environment configuration
console.log('=== KHALTI CONFIGURATION ===')
console.log('Environment:', NODE_ENV)
console.log('Is Production:', isProduction)
console.log('Base URL:', KHALTI_BASE_URL)
console.log('KHALTI_SECRET_KEY:', process.env.KHALTI_SECRET_KEY ? 'Present' : 'Missing or Empty')
console.log('Using Key:', KHALTI_SECRET_KEY ? 'Present' : 'Missing or Empty')
console.log('==============================')

if (!KHALTI_SECRET_KEY) {
    console.error('ERROR: KHALTI_SECRET_KEY is NOT set in environment variables!')
    console.error('Please set KHALTI_SECRET_KEY in your .env file')
    console.error('For testing: Use key from test-admin.khalti.com')
    console.error('For production: Use key from admin.khalti.com')

}

const khaltiHeaders = {
    Authorization: `Key ${KHALTI_SECRET_KEY}`,
    'Content-Type': 'application/json',
}

// 1. Initiate Payment Handler
export const initiatePayment = async (req, res) => {
    console.log('=== INITIATE PAYMENT ===')
    console.log('Environment:', NODE_ENV)
    console.log('Using Base URL:', KHALTI_BASE_URL)
    console.log('Using Secret Key:', KHALTI_SECRET_KEY ? 'Present' : 'Missing or Empty')


    try {
        const { amount, orderId, customerInfo, productDetails, returnUrl } = req.body
        const userId = req.user.id

        if (!amount || !orderId || !customerInfo) {
            console.warn('Missing required fields in initiate payment:', { amount, orderId, customerInfo })

            return res.status(400).json({
                success: false,
                message: 'Missing required fields: amount, orderId, customerInfo',
            })
        }

        const payload = {
            return_url: returnUrl,
            website_url: process.env.FRONTEND_URL,
            amount: Math.round(amount * 100),
            purchase_order_id: orderId,
            purchase_order_name: productDetails?.name || 'Order Payment',
            customer_info: {
                name: customerInfo.name,
                username: customerInfo.username || '',
                phone: customerInfo.phone
            },
            product_details: [
                {
                    identity: productDetails?.identity || orderId,
                    name: productDetails?.name || 'Product',
                    total_price: Math.round(amount * 100),
                    quantity: productDetails?.quantity || 1,
                    unit_price: Math.round(amount * 100),
                },
            ],
        }

        const response = await axios.post(
            `${KHALTI_BASE_URL}epayment/initiate/`,
            payload,
            {
                headers: khaltiHeaders,
                timeout: 15000,
            }
        )

        try {
            const payment = new Payment({
                pidx: response.data.pidx,
                orderId,
                amount,
                customerInfo,
                status: 'initiated',
                created_by: userId,
                environment: NODE_ENV,
            })
            if (!response.data.pidx) {
                console.error('No pidx received from Khalti response:', response.data)
                return res.status(500).json({
                    success: false,
                    message: 'Payment initiation failed: no pidx returned by Khalti',
                })
            }

            await payment.save()
            console.log('Payment saved to DB:', payment)
        } catch (saveError) {
            console.error('Error saving payment to DB:', saveError)

        }

        res.json({
            success: true,
            data: {
                pidx: response.data.pidx,
                payment_url: response.data.payment_url,
                orderId,
                environment: NODE_ENV,
            },
        })
    } catch (error) {
        console.error('Payment initiation error:', error.response?.data || error.message)
        console.error('Full error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to initiate payment',
            error: error.response?.data || error.message,
            environment: NODE_ENV,
        })
    }
}

// 2. Verify Payment Handler
export const verifyPayment = async (req, res) => {
    try {
        console.log('=== VERIFY PAYMENT ===')
        console.log('Environment:', NODE_ENV)
        console.log('Using Base URL:', KHALTI_BASE_URL)
        console.log('Received verify payment request:', req.body)

        const { pidx } = req.body

        if (!pidx) {
            console.warn('Missing pidx in verify payment request')
            return res.status(400).json({ success: false, message: 'pidx is required' })
        }
        console.log('Making request to:', `${KHALTI_BASE_URL}epayment/lookup/`)

        const response = await axios.post(
            `${KHALTI_BASE_URL}epayment/lookup/`,
            { pidx },
            { headers: khaltiHeaders }
        )
        console.log('Khalti verify response:', response.data)
        const khaltiData = response.data

        const payment = await Payment.findOneAndUpdate(
            { pidx },
            {
                status: khaltiData.status.toLowerCase(),
                transactionId: khaltiData.transaction_id,
                updatedAt: new Date(),
            },
            { new: true }
        )

        if (!payment) {
            console.warn('Payment record not found for pidx:', pidx)
            return res.status(404).json({ success: false, message: 'Payment record not found' })
        }

        console.log('Updated payment record:', payment)
        res.json({
            success: true,
            data: {
                status: khaltiData.status,
                transaction_id: khaltiData.transaction_id,
                amount: khaltiData.total_amount / 100,
                payment,
                environment: NODE_ENV,
            },
        })
    } catch (error) {
        console.error('Payment verification error:', error.response?.data || error.message)
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: error.response?.data || error.message,
            environment: NODE_ENV,
        })
    }
}

// 3. Get Payment Status by Order ID Handler
export const getPaymentStatus = async (req, res) => {
    try {
        console.log('Received get payment status request for orderId:', req.params.orderId)
        const { orderId } = req.params

        const payment = await Payment.findOne({ orderId }).sort({ createdAt: -1 })

        if (!payment) {
            console.warn('Payment not found for orderId:', orderId)
            return res.status(404).json({ success: false, message: 'Payment not found' })
        }
        console.log('Found payment:', payment)
        res.json({ success: true, data: payment, environment: NODE_ENV, })
    } catch (error) {
        console.error('Get payment status error:', error.message)
        res.status(500).json({
            success: false,
            message: 'Failed to get payment status',
            error: error.message,
            environment: NODE_ENV,
        })
    }
}

// 4. Webhook Handler (Optional)
export const khaltiWebhook = async (req, res) => {
    try {
        console.log('=== WEBHOOK RECEIVED ===')
        console.log('Environment:', NODE_ENV)
        console.log('Received webhook:', req.body)
        const { pidx, status, transaction_id } = req.body

        await Payment.findOneAndUpdate(
            { pidx },
            {
                status: status.toLowerCase(),
                transactionId: transaction_id,
                updatedAt: new Date(),
            }
        )

        console.log('Payment updated from webhook for pidx:', pidx)

        res.json({ success: true })
    } catch (error) {
        console.error('Webhook error:', error.message)
        res.status(500).json({ success: false, error: error.message, environment: NODE_ENV, })
    }
}

// Health check
export const healthCheck = (req, res) => {
    console.log('Health check endpoint hit')
    res.json({
        status: 'OK', message: 'Khalti Payment Server is running',
        environment: NODE_ENV,
        khalti_base_url: KHALTI_BASE_URL,
        secret_key_configured: KHALTI_SECRET_KEY ? true : false,
        secret_key_type: isProduction ? 'LIVE' : 'TEST',
    })
}

export const addKhaltiNumber = async (req, res) => {
    const { role, id, khaltiNumber } = req.body

    if (!role || !id || !khaltiNumber) {
        return res.status(400).json({ error: 'Role, id, and khaltiNumber are required.' })
    }

    try {
        let Model, doc

        if (role === 'technician') {
            Model = technician
        } else if (role === 'client') {
            Model = client
        } else {
            return res.status(400).json({ error: 'Invalid role. Must be technician or client.' })
        }

        doc = await Model.findById(id)
        if (!doc) {
            return res.status(404).json({ error: `${role} not found.` })
        }

        doc.khaltiNumber = khaltiNumber
        await doc.save()

        res.status(200).json({ message: 'Khalti number updated successfully.', khaltiNumber })
    } catch (error) {
        console.error('Error updating khalti number:', error)
        res.status(500).json({ error: 'Server error.' })
    }
}

export const KhaltiStatus = async (req, res) => {
    const { role, id } = req.query

    if (!role || !id) {
        return res.status(400).json({ error: 'Role and ID are required.' })
    }

    try {
        let Model

        if (role === 'technician') {
            Model = technician
        } else if (role === 'client') {
            Model = client
        } else {
            return res.status(400).json({ error: 'Invalid role. Must be technician or client.' })
        }

        const doc = await Model.findById(id).select('khaltiNumber')

        if (!doc) {
            return res.status(404).json({ error: `${role} not found.` })
        }

        if (doc.khaltiNumber) {
            return res.status(200).json({ exists: true, khaltiNumber: doc.khaltiNumber })
        } else {
            return res.status(200).json({ exists: false })
        }
    } catch (error) {
        console.error('Error checking khalti number:', error)
        res.status(500).json({ error: 'Server error.' })
    }
}

export const getPayments = async (req, res) => {
    try {
        const userId = req.user.id

        // Get the username of the logged-in user
        const user = await User.findById(userId).select('username')

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        const username = user.username

        // Find payments where the user is either the creator or the customer
        const [createdPayments, customerPayments] = await Promise.all([
            Payment.find({ created_by: userId }),
            Payment.find({ 'customerInfo.username': username })
        ])

        // Combine and remove duplicates using a Map keyed by _id
        const combinedPaymentsMap = new Map()

            ;[...createdPayments, ...customerPayments].forEach(payment => {
                combinedPaymentsMap.set(payment._id.toString(), payment)
            })

        const combinedPayments = Array.from(combinedPaymentsMap.values())

        res.status(200).json({
            success: true,
            payments: combinedPayments
        })
    } catch (error) {
        console.error('Error fetching payments:', error)
        res.status(500).json({
            success: false,
            message: 'Server error while fetching payments',
            error: error.message,
        })
    }
}

export const getPaymentDetail = async (req, res) => {
    try {
        const { technicianId, clientId } = req.body

        if (technicianId) {
            const ttechnician = await technician.findById(technicianId)
                .select('khaltiNumber')
                .populate({
                    path: 'user',
                    select: 'fname lname username',
                })

            if (!ttechnician) {
                return res.status(404).json({ success: false, msg: 'Technician not found' })
            }

            return res.status(200).json({
                success: true,
                khaltiNumber: ttechnician.khaltiNumber,
                fname: ttechnician.user.fname,
                lname: ttechnician.user.lname,
                username: ttechnician.user.username,
            })
        } else if (clientId) {
            const cclient = await client.findById(clientId)
                .select('khaltiNumber')
                .populate({
                    path: 'client_id',
                    select: 'fname lname username',
                })

            if (!cclient) {
                return res.status(404).json({ success: false, msg: 'Client not found' })
            }

            return res.status(200).json({
                success: true,
                khaltiNumber: cclient.khaltiNumber,
                fname: cclient.client_id.fname,
                lname: cclient.client_id.lname,
                username: cclient.client_id.username,
            })
        } else {
            return res.status(400).json({ success: false, msg: 'Missing technicianId or clientId' })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, msg: 'Internal server error!' })
    }
}