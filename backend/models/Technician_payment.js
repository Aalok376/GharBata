import mongoose from "mongoose";
const payoutSchema=new mongoose.Schema({
    payout_id:{
        type:String,
        required:true,
        unique:true
    },
    technician_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true

    },
    payout_method_id:{
        type:String,
        required:true
    },
    total_amount:{
        type:Number,
        required:true,
        min:[0,'Total amount cannot be negative']

    },
    payout_fee:{
        type:Number,
        required:true,
        min: [0, 'Payout fee cannot be negative'],
        default:0
    },
    net_amount:{
        type:Number,
        required:true,
           min: [0, 'Net amount cannot be negative'] 
    },
    payout_status:{
        type:String,
        required:true,
         enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
         default:'pending'
    },
    transaction_id:{
        type:String,
        required:true,
        unique:true
    },
    initiated_at:{
        type:Date,
        default:Date.now
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
export default mongoose.model('Payout',payoutSchema);