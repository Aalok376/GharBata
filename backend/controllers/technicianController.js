import Technician from "../models/technician.js";
import User from "../models/user.js";

export const createTechnicianProfile = async(req,res)=>{
    console.log(req.user); 
    try{
        const userId = req.user.id;
        // Validate user role
        const user= await User.findById(userId);
        if(!user || user.role !== 'technician'){
            return res.status(403).json({message: "Unauthorized or invalid user role"});

        }
        // Check if profile already exists
        const existingTech= await Technician.findOne({technician_id: userId});
        if(existingTech){
            return res.status(400).json({ message: "Technician profile already exists"});

        }
        const technician = new Technician({
            technician_id: userId,
            profession: req.body.profession,
            serviceStatus: req.body.serviceStatus || 'active',
            serviceLocation: req.body.serviceLocation,
            availability: req.body.availability,
            currentLocation: req.body.currentLocation,
            rating: 0,
            tasksCompleted: 0,
            isVerified: false,
            isActive: true,   
        });
        await technician.save();
        res.status(201).json({ message:"Technician profile created",technician});

    } catch(error){
        res.status(500).json({ error: error.message});
    }
};