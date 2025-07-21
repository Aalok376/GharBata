import mongoose from 'mongoose'

const technicianSchema = new mongoose.Schema({
  technician_id: {
     type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
       unique: true 
      },
  profession:{
    type: String,
    required : true
  } ,
  serviceStatus:{
    type: String,
    default: 'active'  
  }, 
  serviceLocation: {
    type: String
  },
  availability:{
type: String
  },
  currentLocation: {
    type: String
    },
  rating:{
   type: Number,
   default: 0
  },
  tasksCompleted: {
    type: Number,
    default: 0
  },
  isVerified: {
     type: Boolean,
      default: false
     },
     isActive:{
      type:Boolean,
      default: true
     },
},{
  timestamps: true
})

export default mongoose.model('Technician', technicianSchema)