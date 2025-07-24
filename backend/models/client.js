import mongoose from 'mongoose'

const clientSchema = new mongoose.Schema({
  client_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
     required: true, 
     unique: true
     },
  address: {
    type : String,
    trim: true
  },
  profilePic:{
    type:String,
    default:'./Resources/DALL·E 2025-01-19 21.12.44 - A default profile image featuring a simple and professional design. The image should have a circular border with a neutral gray background and an abst.webp'
  },
  contactNumber:{
    type:String,
    default:null
  }
},{
  timestamps: true
})
export default mongoose.model('Client', clientSchema)

