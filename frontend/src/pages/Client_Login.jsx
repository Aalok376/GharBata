import React, { useState } from "react"; // Importing necessary hooks from React
import { Link } from "react-router-dom"; // React Router links
// Define the Login component

const Client_Login=()=>{
      // useState hooks to manage input values and error messages
      const[email,setEmail]=useState('');    // Stores the email input value
      const[password,setPassword]=useState('');// Stores the password input value
      const[error,setError]=useState(''); // Stores error messages (e.g., when inputs are empty)


// function to handle form submission
      const handleSubmit=(e)=>{
        e.preventDefault(); // prevent the page from reloading on form submit
        // Basic validation: check if both email and password are entered

        if(!email || !password){
            setError('Please enter both email and password'); // Set error message
            return; //Exit the function early
        }
        setError('');// Clear error if both fields are filled

      };



      // JSX returned by the Login components(UI of the login form)
      return(
        // Outer container:center the content vertically and horizontally
        <div className="flex justify-center items-center min-h-screen bg-white">
             {/* Login box container */}
             <div className="bg-white p-8 rounded shadow-lg w-full max-w-md border border-gray-200 ">
                 {/* Heading for the login form */}
                 <h2 className="text-2xl font-bold mb-6 text-center text-black">Login</h2>
                   {/* Show error message if there is one */}
                   {error && <div className="mb-4 text-red-500 text-center">{error}</div>}



                     {/* Login form */}
                     <form onSubmit={handleSubmit} className="space-y-4">
                        {/*Email field */}
                        <div>
                            <label htmlFor="email" className="block mb-1 text-gray-900 ">Email</label>
                            <input
                            type="email" //input type for email validation
                            id="email" //id used to associate with label
                            className="w-full p-2 border rounded " // styling
                            value={email} // current value from state
                            onChange={(e)=> setEmail(e.target.value)} //Update state when user types
                            required // required validation
                            />
                        </div>


                        {/*Password filed*/}
                        <div>
                            <label htmlFor="password" className="block mb-1 text-gray-900 ">Password</label>
                            <input
                            type="password" // hides characters as user types
                            id="password"
                            className="w-full p-2 border rounded "
                            value={password}
                            onChange={(e)=>setPassword(e.target.value)}
                            required
                            />
                        </div>



                        {/*Submit Button */}
                        <button
                        type="submit" // Submits the form
                        className="w-full bg-orange-500 hover:bg-orange-700 text-white p-2 rounded"
                        >
                            Login As Client
                        </button>
                     </form>
                     {/*React Router Links*/}
                     <div className="mt-4 text-center text-sm text-gray-700">
                        <p>
                            Don't have an account?{''}
                             <Link to="/client_signup" className="text-orange-600 hover:underline">
                             Sign up
                             </Link>
                        </p>
                        <p className="mt-2">
                            <Link to="/forgot-password" className="text-orange-600 hover:underline">
                            Forgot password?
                            </Link>
                        </p>
                     </div>
             </div>
        </div>
      );

};
// Export the component so it can be used in other parts of your app
export default Client_Login;