import Service from '../models/Service.js';

// Create a new service
export const createService = async (req, res) => {
  try {
    const serviceData = req.body;
    serviceData.created_by = req.user._id; // Assuming user info is attached by auth middleware

    const newService = new Service(serviceData);
    await newService.save();

    res.status(201).json({ message: 'Service created successfully', service: newService });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create service', error: error.message });
  }
};

// Get all active services
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ is_active: true });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch services', error: error.message });
  }
};

// Get service by ID
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service', error: error.message });
  }
};

// Update service by ID
export const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json({ message: 'Service updated successfully', service });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update service', error: error.message });
  }
};

// Soft delete (deactivate) service
export const deactivateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { is_active: false },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json({ message: 'Service deactivated', service });
  } catch (error) {
    res.status(500).json({ message: 'Failed to deactivate service', error: error.message });
  }
};
