import Client from "../models/client.js"
import User from "../models/user.js"

export const createClientProfile = async (req, res) => {
  try {
    const userId = req.user.id

    // Validate uploaded file
    if (!newProfilePicture || !newProfilePicture.path) {
      return res.status(400).json({ success: false, message: "Profile picture is required" })
    }

    // Check if user exists and role is 'client'
    const user = await User.findById(userId)
    if (!user || user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized or invalid user role",
      })
    }

    // Check if client profile already exists
    const existingClient = await Client.findOne({ client_id: userId })
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: "Client profile already exists",
      })
    }

    // Create and save client profile
    const client = new Client({
      client_id: userId,
      address: req.body.address,
      profilePic: req.body.profilePic,
      contactNumber: req.body.contactNumber,
    })

    await client.save()

    // OPTIONAL: Set profile completion flag
    user.isProfileComplete = true
    await user.save()

    res.status(201).json({ success: true, message: "Client profile created", client })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const isClientProfileComplete = async (req, res) => {
  const {username}= req.body

  try {
    const userProfile =await User.findOne({username})

    if (!userProfile) {
      return res.status(400).json({ success: false, msg: 'User not found' })
    }

    if (userProfile.isProfileComplete) {
      return res.status(201).json({ success: true, msg: 'User profile has been created' })
    }
    return res.status(200).json({ success: true, msg: 'User profile hasnt been created' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, msg: 'Internal server error' })
  }
}