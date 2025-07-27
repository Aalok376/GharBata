import mongoose from "mongoose";
const transactionSchema=new mongoose.Schema({
    transaction_uuid:{
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
    service_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Service',
        required: true
    },
   amount:{
    type: Number,
    required: true
   },
   tax_amount:{
    type: Number,
    default: 0
   },
    service_charge: {
    type: Number,
    default: 0
  },

   delivery_charge:{
    type: Number,
    default: 0
   },
   total_amount:{
    type: Number,
    required: true
   },
   product_code:{
    type: String,
    default: 'EPAYTEST'
   },
   status:{
    type: String,
    enum :['PENDING', 'COMPLETE', 'FAILED', 'CANCELLED'],
    default: 'PENDING'
   },
   transaction_code: {
    type: String,
    default: null
   },
   esewa_ref_id:{
    type: String,
    default: null
   },
   payment_method: {
    type:String,
    default: 'ESEWA'
   },
   signature: {
    type: String,
    required: true
   },
   response_signature: {
    type: String,
    default: null
   }

},
{
    timestamps:true
}
);
export default mongoose.model('Transaction',transactionSchema);