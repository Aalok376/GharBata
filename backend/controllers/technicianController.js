import Technician from '../models/technician.js';

export const createTechnician = async (userId, body) => {
  const technician = new Technician({ userId, ...body });
  await technician.save();
  return technician;
};

export const getTechnicianProfile = async (req, res) => {
  try {
    const technician = await Technician.findOne({ userId: req.user._id }).populate('userId', '-password');
    if (!technician) return res.status(404).json({ message: 'Technician profile not found' });
    res.json(technician);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};