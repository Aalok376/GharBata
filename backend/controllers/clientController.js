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
    user.isProfileComplete = true
    await user.save()

    res.status(201).json({ success: true, message: "Client profile created", client })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export const isClientProfileComplete = async (req, res) => {
  const { username } = req.body

  try {

    const userProfile = await User.findOne({ username })

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
        const user = await User.findById(req.user.id)

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const { fname,lname,username,_id } = user;

        return res.status(200).json({ user:{fname,lname,username,_id} });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ msg: 'Error fetching profile', error });
    }
}
