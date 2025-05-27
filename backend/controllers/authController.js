// Register function
export const register = async (req, res) => {
  try {
    //registration logic
    res.status(201).json({ message: "User registered" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login function
export const login = async (req, res) => {
  try {
    //login logic
    res.status(200).json({ message: "Logged in" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify Email function
export const verifyEmail = async (req, res) => {
  try {
    //email verification logic
    res.status(200).json({ message: "Email verified" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
