import Client from '../models/client.js';

export const createClient = async (userId, body) => {
  const client = new Client({ userId, ...body });
  await client.save();
  return client;
};

export const getClientProfile = async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user._id }).populate('userId', '-password');
    if (!client) return res.status(404).json({ message: 'Client profile not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};