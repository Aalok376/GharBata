import React, { useState } from "react"; //import react and the useState hook
import { Link } from "react-router-dom";

// Signup component definition
const Technician_Signup = () => {
  // Define state to hold form input values
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  //Update formData when input values change
  const handleChange = (e) => {
    setFormData({
      ...formData, // copy the existing data(name,password,email,phonenumber)
      [e.target.name]: e.target.value, //update the field that changed(email)
    });
  };

  // handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // prevent default form submission behaviour
    console.log("Form submitted:", formData);
  };
  return (
    // Full screen container with center alignment
    <div className="flex justify-center items-center min-h-screen bg-light ">
      {/*SignUp form container*/}
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-md border-gray-200">
        {/*Heading*/}
        <h2 className="text-2xl font-bold mb-6 text-center ">Sign Up</h2>
        {/*Signup form*/}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/*Name input field*/}
          <div>
            <label htmlFor="name" className="block mb-1 text-gray-600">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full p-2 border rounded "
              value={formData.name} //Keeps the input value in sync with state
              onChange={handleChange} //Updates the state when user types
              required
            />
          </div>
          {/*Email input field*/}
          <div>
            <label htmlFor="email" className="block mb-1 text-gray-600 ">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full p-2 border rounded "
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          {/*Phone Number input field*/}
          <div>
            <label htmlFor="phoneNumber" className="block mb-1 text-gray-600">
              Phone Number
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              className="w-full p-2 border rounded "
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              pattern="\d{10}" // ensures exactly 10 digits
              title="Phone Number must be exactly 10 digits"
            />
          </div>

          {/*Password input field*/}
          <div>
            <label htmlFor="password" className="block mb-1 text-gray-600">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full p-2 border rounded"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {/*Submit button*/}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-800 text-white p-2 rounded"
          >
            Sign Up As Technician
          </button>
        </form>
        {/*Link to login page*/}
        <p className="mt-4 text-center text-gray-600 ">
          Already have an Account?
          <Link to="/technician_login" className="text-orange-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Technician_Signup; // export the component for use in other files
