const BASE_URL = 'http://localhost:5000'

export const SignUp = async ({ username, password, fname, lname }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/emailVerification`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, fname, lname })
    })

   const result = response.json()
    return result

  } catch (error) {
    console.error(error)
    return false
  }
}

export const register = async ({ username, password, fname, lname, userType, userInputOtp }) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, fname, lname, userType, userInputOtp })
    })

    console.log(response)

    const result = response.json()
    return result

  } catch (error) {
    console.error(error)
    return false
  }
}

export const Llogin = async ({ username, password }) => {
  console.log(username, password)
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    })
    const result = response.json()
    return result

  } catch (error) {
    console.log(error)
  }
}
