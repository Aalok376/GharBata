import Technician from "../models/technician.js";
import User from "../models/user.js";
import uploadParser from "../utils/multer.js";

export const createTechnicianProfile = async (req, res) => {
   uploadParser(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "Image upload failed", error: err.message });
    }
    try {
        const userId = req.user.id;

        // Validate user role
        const user = await User.findById(userId);
        if (!user || user.userType !== 'technician') {
            return res.status(403).json({ message: "Unauthorized or invalid user role" });
        }

        // Check if profile already exists
        const existingTech = await Technician.findOne({ technician_id: userId });
        if (existingTech) {
            return res.status(400).json({ message: "Technician profile already exists" });
        }

        // Create new technician profile with extended fields
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

            // New fields
            specialties: req.body.specialties || [],
            experience: req.body.experience || "0 years",
            hourlyRate: req.body.hourlyRate || 0,
            responseTime: req.body.responseTime || "Not specified",
            reviews: 0,
              avatar: req.file ? req.file.path : "", // Cloudinary URL
        });

        await technician.save();
        res.status(201).json({ message: "Technician profile created", technician });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });
};

export const getAllTechnicians = async (req, res) => {
    try {
    const technicians = await Technician.find()
      .populate('technician_id', 'fname lname profilePicture contactNumber');
    res.status(200).json(technicians);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTechnicianProfile = async (req, res) => {
    uploadParser(req, res, async (err) => {
         if (err) {
      return res.status(400).json({ message: "Image upload failed", error: err.message });
    }
  try {
    const userId = req.user.id;

    // Ensure only technician can update
    const user = await User.findById(userId);
    if (!user || user.userType !== 'technician') {
      return res.status(403).json({ message: "Unauthorized or invalid user role" });
    }

    const technician = await Technician.findOne({ technician_id: userId });
    if (!technician) {
      return res.status(404).json({ message: "Technician profile not found" });
    }

    // Update only the allowed fields
    const {
      profession,
      serviceStatus,
      serviceLocation,
      availability,
      currentLocation,
      specialties,
      experience,
      hourlyRate,
      responseTime,
   
      isVerified,
      isActive
    } = req.body;

    // Assign updated fields only if provided
    if (profession !== undefined) technician.profession = profession;
    if (serviceStatus !== undefined) technician.serviceStatus = serviceStatus;
    if (serviceLocation !== undefined) technician.serviceLocation = serviceLocation;
    if (availability !== undefined) technician.availability = availability;
    if (currentLocation !== undefined) technician.currentLocation = currentLocation;
    if (specialties !== undefined) technician.specialties = specialties;
    if (experience !== undefined) technician.experience = experience;
    if (hourlyRate !== undefined) technician.hourlyRate = hourlyRate;
    if (responseTime !== undefined) technician.responseTime = responseTime;

    if (isVerified !== undefined) technician.isVerified = isVerified;
    if (isActive !== undefined) technician.isActive = isActive;

if (req.file) {
        technician.avatar = req.file.path; // Cloudinary image URL
      }
    const updatedTechnician = await technician.save();

    res.status(200).json({
      message: 'Technician profile updated successfully',
      technician: updatedTechnician
    });
  } catch (error) {
    console.error("Update Technician Error:", error);
    res.status(500).json({ error: error.message });
  }
});
};
