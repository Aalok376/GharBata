import Client from "../models/client.js"
import User from "../models/user.js"

export const createClientProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const profilePicUrl = req.file?.path
    console.log(profilePicUrl)

    // Check if user exists and role is 'client'
    const user = await User.findById(userId)
    if (!user || user.userType !== "client") {
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
      profilePic: profilePicUrl,
      contactNumber: req.body.contactNumber,
    })

    await client.save()

    // OPTIONAL: Set profile completion flag
    user.fname = req.body.fname || user.fname
    user.lname = req.body.lname ||user.lname
    user.isProfileComplete = true
    await user.save()

    res.status(201).json({ success: true, message: "Client profile created", client })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const isClientProfileComplete = async (req, res) => {
  const { userId } = req.body

  try {

    const userProfile = await User.findById(userId)

    if (!userProfile) {
      return res.status(400).json({ success: false, msg: 'User not found' })
    }

    if (userProfile.isProfileComplete) {
      return res.status(201).json({ success: true, msg: 'User profile has been created' })
    }

    return res.status(200).json({ success: true, msg: 'User profile has not been created' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, msg: 'Internal server error' })
  }
}

export const profile = async (req, res) => {
  try {
    const idToFind = req.body.userId || req.user.id;

    const user = await Client.findOne({ client_id: idToFind })
      .populate('client_id', '-password')

    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' })
    }

    return res.status(200).json({ success: true, user })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return res.status(500).json({ success: false, msg: 'Error fetching profile', error })
  }
}

export const updateClientProfile = async (req, res) => {
  try {
    const userId = req.user.id

    // Check if the user exists
    const user = await User.findById(userId)
    if (!user || user.userType !== "client") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized or invalid user role",
      })
    }

    // Get the existing client
    const client = await Client.findOne({ client_id: userId })
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found",
      })
    }

    // Handle profile picture
    const profilePicUrl = req.file?.path

    // Update client fields
    client.address = req.body.address || client.address
    client.contactNumber = req.body.contactNumber || client.contactNumber
    if (profilePicUrl) {
      client.profilePic = profilePicUrl
    }
    await client.save()

    // Update user fields (fname/lname)
    user.fname = req.body.fname || user.fname
    user.lname = req.body.lname || user.lname
    await user.save()

    res.status(200).json({
      success: true,
      message: "Client profile updated successfully",
      client,
    })
  } catch (error) {
    console.error("Error updating client profile:", error)
    res.status(500).json({
      success: false,
      message: "Error updating client profile",
      error: error.message,
    })
  }
}


