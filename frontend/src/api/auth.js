const BASE_URL = import.meta.env.BASE_URL

export const SignUp = async ({username, password, fname, lname}) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/emailVerification`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, fname, lname })
    })

    if (response.status === 200) {
      return true
    }
    else {
      return false
    }
  } catch (error) {
    console.error(error)
    return false
  }
}

export const register = async ({username, password, fname, lname, userType}) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, fname, lname, userType })
    })

    if (response.status === 200) {
      return true
    }
    else {
      return false
    }
  } catch (error) {
    console.error(error)
    return false
  }
}
