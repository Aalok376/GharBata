import Technician from "../models/technician.js"
import User from "../models/user.js"

export const createTechnicianProfile = async (req, res) => {
  try {
    const {
      username,
      professions,
      hourlyRate,
      serviceLocation,
      availability,
      currentLocation,
      specialties,
      experience,
      responseTime
    } = req.body

    const user = await User.findOne({ username })
    if (!user) return res.status(404).json({ msg: "User not found" })

    const existing = await Technician.findOne({ user: user._id })
    if (existing) return res.status(400).json({ msg: "Technician already exists" })

    const technician = new Technician({
      user: user._id,
      professions: JSON.parse(professions || "[]"),
      hourlyRate: JSON.parse(hourlyRate || "{}"),
      serviceLocation,
      availability: JSON.parse(availability || "{}"),
      currentLocation,
      specialties: JSON.parse(specialties || "[]"),
      experience,
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
      hourlyRate,
      serviceLocation,
      availability,
      currentLocation,
      specialties,
      experience,
      responseTime
    } = req.body

    const user = await User.findOne({ username })
    if (!user) return res.status(404).json({ msg: "User not found" })

    const technician = await Technician.findOne({ user: user._id })
    if (!technician) return res.status(404).json({ msg: "Technician profile not found" })

    // Technician updates
    if (professions) technician.professions = JSON.parse(professions)
    if (hourlyRate) technician.hourlyRate = JSON.parse(hourlyRate)
    if (serviceLocation) technician.serviceLocation = serviceLocation
    if (availability) technician.availability = JSON.parse(availability)
    if (currentLocation) technician.currentLocation = currentLocation
    if (specialties) technician.specialties = JSON.parse(specialties)
    if (experience) technician.experience = experience
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
    const {userId}=req.body

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

export const getAllTechnicians=async (req, res) => {
  try {
    const { category } = req.query

    console.log(category)

    const filter = category ? { professions: category } : {}

    const technicians = await Technician.find(filter).populate({
      path: 'user',
      select: '-password'
    })

    res.status(200).json(technicians)
  } catch (err) {
    console.error('Error fetching technicians:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const rateTechnician = async (req, res) => {
  try {
    const { technicianId, profession, rating } = req.body

    if (!technicianId || !profession || typeof rating !== 'number') {
      return res.status(400).json({ msg: 'Invalid input' })
    }

    const technician = await Technician.findById(technicianId)
    if (!technician) return res.status(404).json({ msg: 'Technician not found' })

    const current = technician.rating.get(profession) || { average: 0, totalRatings: 0, sumRatings: 0 }

    const updated = {
      totalRatings: current.totalRatings + 1,
      sumRatings: current.sumRatings + rating,
      average: (current.sumRatings + rating) / (current.totalRatings + 1)
    }

    technician.rating.set(profession, updated)
    await technician.save()

    res.status(200).json({
      msg: 'Rating updated successfully',
      updatedRating: updated
    })
  } catch (err) {
    console.error('Rating update error:', err)
    res.status(500).json({ msg: 'Internal Server Error' })
  }
}

export const writeReview = async (req, res) => {
  const userId=req.user.id
  try {
    const { technicianId, profession, reviewText } = req.body

    if (!technicianId || !userId || !profession || !reviewText) {
      return res.status(400).json({ msg: 'Missing required fields' })
    }

    const technician = await Technician.findById(technicianId)
    if (!technician) return res.status(404).json({ msg: 'Technician not found' })

    const newReview = {
      userId,
      profession,
      reviewText,
      createdAt: new Date()
    }

    const currentReviews = technician.reviews.get(profession) || []
    technician.reviews.set(profession, [...currentReviews, newReview])

    await technician.save()

    res.status(200).json({ msg: 'Review added successfully', review: newReview })
  } catch (err) {
    console.error('Error writing review:', err)
    res.status(500).json({ msg: 'Internal Server Error' })
  }
}

export const getReviewsByProfession = async (req, res) => {
  try {
    const { technicianId, profession } = req.params

    const technician = await Technician.findById(technicianId)
      .populate({
        path: `reviews.${profession}.userId`,
        select: 'fname lname profilePic'
      })

    if (!technician) {
      return res.status(404).json({ msg: 'Technician not found' })
    }

    const reviewsForProfession = technician.reviews.get(profession) || []

    res.status(200).json({ reviews: reviewsForProfession })
  } catch (err) {
    console.error('Error fetching reviews:', err)
    res.status(500).json({ msg: 'Internal Server Error' })
  }
}

export const getOverallAverageRating = async (req, res) => {
  try {
    const { technicianId } = req.params

    // Fetch technician with ratings (assumes ratings stored as average per profession)
    const technician = await Technician.findById(technicianId)

    if (!technician) {
      return res.status(404).json({ msg: 'Technician not found' })
    }

    // Assuming `technician.averageRatingPerProfession` is an object like:
    // { "Electrician": 4.5, "Plumber": 3.8, ... }
    const ratingsObj = technician.averageRatingPerProfession || {}

    const ratingValues = Object.values(ratingsObj).filter(r => typeof r === 'number' && !isNaN(r))

    if (ratingValues.length === 0) {
      return res.status(200).json({ overallAverageRating: 0 }) // No ratings yet
    }

    // Calculate average of averages
    const overallAverage = ratingValues.reduce((sum, r) => sum + r, 0) / ratingValues.length

    res.status(200).json({ overallAverageRating: overallAverage })
  } catch (error) {
    console.error('Error fetching overall average rating:', error)
    res.status(500).json({ msg: 'Internal Server Error' })
  }
}

