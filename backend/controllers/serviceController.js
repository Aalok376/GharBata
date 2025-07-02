import Service from "../models/Service.js";
import User from "../models/user.js";

export const createService= async (req,res) => {
    try{
        const userId= req.user.id;
        const userRole = req.userRole;

        if(!['technician','admin'].includes(userRole)){
            return res.status(403).json({message: 'Only technicians or admins can create services'});
        }
        const {name,description,category,service_price,duration_hours}=req.body
        
         if(!name || !description || !category || !service_price == null || duration_hours == null){
            return res.status(400).json({message:'All Fields are required'});
         }
         // Create service
         const service= new Service({
            name,
            description,
            category,
            service_price,
            duration_hours,
            created_by: userId
         });
         await service.save();
         res.status(201).json({message:"Service created successfully",service});

    }catch (error){
        res.status(500).json({error: error.message});
    }
    
};
// get all active services
export const getAllActiveServices= async(req,res)=>{
    try {
        const services= await Service.find({is_active: true});
        res.status(200).json({services});

        
    } catch (error) {
        res.status(500).json({error: error.message});
        
    }
};
// Deactive a Service 
export const deactiveService= async (req,res) => {
    try {
        const {serviceId}= req.params;
        const service= await Service.findById(serviceId);
        if(!service){
            return res.status(404).json({message:'Service not found'});
        }
        service.is_active=false;
        await service.save();
        res.status(200).json({message:'Service deactivated successfully'});
        
    } catch (error) {
        res.status(500).json({error: error.message});
        
    }
    
};
// get service by ID
export const getServiceById= async (req,res) => {
    try {
     const {serviceId}=req.params;
     const service= await Service.findById(serviceId);
     if(!service || !service.is_active){
        return res.status(404).json({message:'Service not found or inactive'});
     }   
     res.status(200).json({service});

    } catch (error) {
        res.status(500).json({error:error.message});
        
    }
    
};