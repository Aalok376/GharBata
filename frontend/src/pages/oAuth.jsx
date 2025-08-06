import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const OAuthSuccess = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const query = new URLSearchParams(location.search)
    const user = query.get('user')

    if (user) {
      const parsedUser = JSON.parse(decodeURIComponent(user))
      console.log('Logged in user:', parsedUser)

      const userId = parsedUser.id || parsedUser._id
      const username = parsedUser.username
      const userType = parsedUser.userType

      // Store user info
      localStorage.setItem('user', JSON.stringify(parsedUser))
      sessionStorage.setItem('userId', userId)
      sessionStorage.setItem('username', username)

      setLoading(true)

      if (userType === 'client') {
        fetch('https://gharbata.onrender.com/api/clients/getClientprofilestatus', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        })
          .then((res) => {
            if (res.status === 200) {
              // Profile incomplete → redirect to client profile setup
              navigate(`/clientProfileSetupPage/${userId}`)
            } else {
              // Profile complete → redirect to client dashboard
              navigate('/client/dashboard')
            }
          })
          .catch((err) => {
            console.error('Client profile status check failed:', err)
            navigate('/client/dashboard')
          })
      } else if (userType === 'technician') {
        fetch('https://gharbata.onrender.com/api/clients/getClientprofilestatus', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        })
          .then((res) => {
            if (res.status === 200) {
              // Profile incomplete → redirect to professional profile setup
              navigate(`/professionalProfilePage/${userId}`)
            } else {
              // Profile complete → redirect to technician dashboard
              navigate('/professional/dashboard')
            }
          })
          .catch((err) => {
            console.error('Technician profile status check failed:', err)
            navigate('/professional/dashboard')
          })
      } else {
        setLoading(false)
        navigate('/')
      }
    } else {
      navigate('/')
    }
  }, [location, navigate])

  if (loading) {
    return <div>Loading your profile status...</div>
  }

  return <div>Logging you in...</div>
}

export default OAuthSuccess
