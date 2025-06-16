import mongoose from "mongoose";
const paymentSchema=new mongoose.Schema({
    payment_id:{
        type: String,
        required:true,
        unique:true
    },
    booking_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Booking',
        required:true
    },
    client_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    technician_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    amount:{
        type: Number,
        required:true,
        min:[0,'Amount cannot be negative']
    },
    payment_method_id:{
        type:String,
        required:true
    },
    payment_status:{
        type:String,
        required:true,
        enum:['pending','processing','completed','failed','cancelled','refunded'],
        default:'pending'
    },
    transaction_id:{
        type:String,
        required:true,
        uniques:true
    },
    payment_gateway:{
        type:String,
        required:true,
        enum:['khalti','e-sewa']
    },
    service_amount:{
        type:Number,
        required:true,
        min:[0,'Service amount cannot be negative']
    },
    discount_amount:{
        type:Number,
        default:0,
        min:[0,'Discount amount cannot be negative']
    },
    total_amount:{
        type:Number,
        required:true,
        min:[0,'Total amount cannot be negative']
    },
    completed_at:{
        type:Date
    },
    created_at:{
        type:Date,
        default:Date.now
    }
},
{
    timestamps:true
}
);
export default mongoose.model('Payment',paymentSchema);