import mongoose from 'mongoose'
const serviceSchema= new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
        minLength:[2, 'Service name must be at least 2 characters'],
        maxLength: [100,'Service name cannot exceed 100 characters']


    },
    description: {
        type: String,
        required: true,
        trim: true,
        minLength: [10,'Service description must be at least 10 characters'],
        maxLength: [500, 'Service description cannot exceed 500 characters']

    },
    category: {
        type: String,
        required: true,
        enum:{
            values:['plumbing','electrical','cleaning','gardening','painting','carpentry','pest control','appliance_repair','other'],
        message:'Invalid service category'
        }
    },
    service_price:{
        type: Number,
        required: true,
        min: [0,'Service price cannot be negative'],
        max: [10000,'Service price cannot exceed 10000']
    },
    duration_hours:{
        type: Number,
        required: true,
        min:[0.5,'Service duration must be at least 0.5 hours'],
        max:[24,'Service duration cannot exceed 24 hours']
    },
    is_active:{
        type: Boolean,
        default: true,
    },
    created_by:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    }
})
export default mongoose.model('Service',serviceSchema)