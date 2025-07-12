import Client from "../models/client.js"
import User from "../models/user.js"

export const createClientProfile= async(req,res)=>{
    try{
        const userId= req.user.id

        // Check if user exists and role is client
        const user= await User.findById(userId)
        if(!user || user.role !== 'client'){
            return res.status(403).json({
                message: "Unauthorized or Invalid user role"
            })
        }
        // Check if profile already exists
        const existingClient = await Client.findOne({
            client_id: userId
        })
        if(existingClient){
            return res.status(400).json({
                message: "Client profile already exists"
            })
        }
        const client= new Client({
            client_id: userId,
            address: req.body.address,
            servicePreferences: req.body.servicePreferences || []
        })
        await client.save()
        res.status(201).json({message: 'Client profile created',client})
    }catch (error){
        res.status(500).json({error: error.message})
    }
}