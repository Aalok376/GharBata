import React, { useEffect, useState } from "react";
import { bookingService } from "../services/bookingapi";
import { useNavigate } from "react-router-dom";

const CreateBooking = () => {
  const [technicians, setTechnicians] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch technicians and services
  useEffect(() => {
    const fetchData = async () => {
      try {
        const techRes = await fetch("/api/technicians");
        const techData = await techRes.json();
        setTechnicians(techData);

        const serviceRes = await fetch("/api/services");
        const serviceData = await serviceRes.json();
        setServices(serviceData);
      } catch (err) {
        setError("Failed to fetch technicians or services.");
      }
    };

    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const bookingData = {
        technicianId: selectedTechnician,
        serviceId: selectedService,
      };

      const result = await bookingService.createBooking(bookingData);
      if (result.success && result.redirectUrl) {
        window.location.href = result.redirectUrl; // Redirect to eSewa
      } else {
        navigate("/payment/failure");
      }
    } catch (err) {
      setError("Booking failed. Try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Create Booking</h2>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Select Technician:</label>
        <select
          className="w-full border p-2 mb-4"
          value={selectedTechnician}
          onChange={(e) => setSelectedTechnician(e.target.value)}
          required
        >
          <option value="">-- Choose Technician --</option>
          {technicians.map((tech) => (
            <option key={tech._id} value={tech._id}>
              {tech.profession} ({tech.technician_id?.name || "Technician"})
            </option>
          ))}
        </select>

        <label className="block mb-2">Select Service:</label>
        <select
          className="w-full border p-2 mb-4"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          required
        >
          <option value="">-- Choose Service --</option>
          {services.map((service) => (
            <option key={service._id} value={service._id}>
              {service.title} - Rs. {service.price}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Create Booking & Pay
        </button>
      </form>
    </div>
  );
};

export default CreateBooking;
