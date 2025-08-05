import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
    pidx: {
        type: String,
        required: true,
        unique: true,
        index: true, // Improves lookup performance
    },
    orderId: {
        type: String,
        required: true,
        index: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 1,
    },
    status: {
        type: String,
        enum: ['pending', 'initiated', 'completed', 'failed'],
        default: 'pending',
    },

    transactionId: {
        type: String,
        default: null,
    },
    customerInfo: {
        name: { type: String, required: true },
        username: { type: String },
        phone: { type: String },
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true,
    },
    updatedAt: {
        type: Date,
        default: () => Date.now(),
    },
}, {
    timestamps: true,
})

const Payment = mongoose.model('Payment', paymentSchema)

export default Payment
