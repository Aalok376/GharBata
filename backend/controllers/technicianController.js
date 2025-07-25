import Technician from "../models/technician.js"
import User from "../models/user.js"

export const createTechnicianProfile = async (req, res) => {
  try {
    const {
      username,
      professions,
      serviceLocation,
      availability,
      currentLocation,
      specialties,
      experience,
      hourlyRate,
      responseTime
    } = req.body

    const user = await User.findOne({ username })
    if (!user) return res.status(404).json({ msg: "User not found" })

    const existing = await Technician.findOne({ user: user._id })
    if (existing) return res.status(400).json({ msg: "Technician already exists" })

    const technician = new Technician({
      user: user._id,
      professions: JSON.parse(professions || "[]"),
      serviceLocation,
      availability: JSON.parse(availability || "{}"),
      currentLocation,
      specialties: JSON.parse(specialties || "[]"),
      experience,
      hourlyRate: parseFloat(hourlyRate),
      responseTime,
      profilePic: req.file?.path || ""
    })

    await technician.save()

    user.isProfileComplete = true
    await user.save()

    res.status(201).json({ msg: "Technician created", technician })
  } catch (err) {
    console.error("Error creating technician:", err)
    res.status(500).json({ msg: "Internal Server Error" })
  }
}

export const updateTechniciansProfile = async (req, res) => {
  try {
    const {
      username,
      fname,
      lname,
      professions,
      serviceLocation,
      availability,
      currentLocation,
      specialties,
      experience,
      hourlyRate,
      responseTime
    } = req.body

    const user = await User.findOne({ username })
    if (!user) return res.status(404).json({ msg: "User not found" })

    const technician = await Technician.findOne({ user: user._id })
    if (!technician) return res.status(404).json({ msg: "Technician profile not found" })

    // Technician updates
    if (professions) technician.professions = JSON.parse(professions)
    if (serviceLocation) technician.serviceLocation = serviceLocation
    if (availability) technician.availability = JSON.parse(availability)
    if (currentLocation) technician.currentLocation = currentLocation
    if (specialties) technician.specialties = JSON.parse(specialties)
    if (experience) technician.experience = experience
    if (hourlyRate !== undefined) technician.hourlyRate = parseFloat(hourlyRate)
    if (responseTime) technician.responseTime = responseTime

    if (req.file) {
      technician.profilePic = req.file.path
    }

    // Update user name fields
    if (fname) user.fname = fname
    if (lname) user.lname = lname

    await user.save()
    await technician.save()

    res.status(200).json({ msg: "Technician and user updated successfully", technician, user })
  } catch (error) {
    console.error("Update error:", error)
    res.status(500).json({ msg: "Internal Server Error" })
  }
}


export const getTechnicianProfile = async (req, res) => {
  try {
    const userId=req.user.id

    const user = await User.findById(userId).select("-password")
    if (!user) return res.status(404).json({ msg: "User not found" })

    const technician = await Technician.findOne({ user: userId }).populate({
      path: "user",
      select: "fname lname username ",
    })

    if (!technician)
      return res.status(404).json({ msg: "Technician profile not found" })

    res.status(200).json({ technician })
  } catch (err) {
    console.error("Fetch profile error:", err)
    res.status(500).json({ msg: "Internal Server Error" })
  }
}