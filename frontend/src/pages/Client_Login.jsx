import React, { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Toaster, toast } from 'sonner'
import { Llogin } from "../api/auth"

const ClientLogin = () => {
  const [username, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()

  const [userType, setUserType] = useState()

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("") // Clear previous errors

    try {

      const rresult = await Llogin({ username, password })

      setUserType(rresult.user.userType)
      if (rresult.success) {
        const userId = rresult.user._id
        sessionStorage.setItem('userId', userId)
        sessionStorage.setItem('username', username)

        const navi = await fetch('http://localhost:5000/api/clients/getClientprofilestatus', {
          method: 'POST',
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId })
        })

        if (userType === 'client') {
          if (navi.status === 200) {
            navigate(`/clientProfileSetupPage/${userId}`)
          } else {
            navigate("/client/dashboard")
          }
        } else if (userType === 'technician') {
          if (navi.status === 200) {
            // User profile needs to be set up
            navigate(`/professionalProfilePage/${userId}`)
          } else {
            // User profile already exists, go to dashboard
            navigate("/professional/dashboard")
          }
        }
        else if (userType === 'admin') {
          navigate(`/admin/dashboard`)
        }

      } else {
        // Handle different types of login errors
        if (rresult.msg && (
          rresult.msg.toLowerCase().includes('password') ||
          rresult.msg.toLowerCase().includes('invalid credentials') ||
          rresult.msg.toLowerCase().includes('incorrect password')
        )) {
          setError("Invalid Credentials")
        } else if (rresult.msg && (
          rresult.msg.toLowerCase().includes('user') ||
          rresult.msg.toLowerCase().includes('username') ||
          rresult.msg.toLowerCase().includes('email')
        )) {
          setError("User not found")
        } else {
          setError(rresult.msg || "Login failed. Please try again.")
        }
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (<>
    <style>
      {`
        .mainBlock {
        display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
        }

        .login-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 25px 45px rgba(0, 0, 0, 0.1);
            padding: 40px;
            width: 100%;
            max-width: 700px;
            position: relative;
            overflow: hidden;
            animation: slideUp 0.6s ease-out;
        }

        .login-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
            background-size: 200% 100%;
            animation: shimmer 2s infinite;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }

        .logo {
            text-align: center;
            margin-bottom: 30px;
            animation: fadeIn 0.8s ease-out 0.2s both;
        }

        .logo h1 {
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 5px;
        }

        .logo p {
            color: #666;
            font-size: 0.9rem;
            font-weight: 500;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .form-group {
            margin-bottom: 25px;
            position: relative;
            animation: fadeIn 0.8s ease-out 0.4s both;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
            font-size: 0.9rem;
        }

        .form-group input {
            width: 100%;
            padding: 15px 20px;
            border: 2px solid #e1e5e9;
            border-radius: 12px;
            font-size: 1rem;
            transition: all 0.3s ease;
            background: #fafbfc;
        }

        .form-group input:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            transform: translateY(-2px);
        }

        .form-group input::placeholder {
            color: #a0a6b0;
        }

        .forgot-password {
            text-align: right;
            margin-bottom: 25px;
            animation: fadeIn 0.8s ease-out 0.6s both;
        }

        .forgot-password a {
            color: #667eea;
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
            transition: color 0.3s ease;
        }

        .forgot-password a:hover {
            color: #764ba2;
        }

        .login-btn {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            animation: fadeIn 0.8s ease-out 0.8s both;
        }

        .login-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }

        .login-btn:disabled:hover {
            transform: none;
            box-shadow: none;
        }

        .login-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.6s;
        }

        .login-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .login-btn:hover:not(:disabled)::before {
            left: 100%;
        }

        .login-btn:active:not(:disabled) {
            transform: translateY(0);
        }

        .divider {
            text-align: center;
            margin: 30px 0;
            position: relative;
            animation: fadeIn 0.8s ease-out 1s both;
        }

        .divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: #e1e5e9;
        }

        .divider span {
            background: rgba(255, 255, 255, 0.95);
            padding: 0 20px;
            color: #666;
            font-size: 0.9rem;
        }

        .social-login {
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
            animation: fadeIn 0.8s ease-out 1.2s both;
        }

        .social-btn {
            flex: 1;
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 500;
        }

        .social-btn:hover {
            border-color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .signup-link {
            text-align: center;
            color: #666;
            font-size: 0.9rem;
            animation: fadeIn 0.8s ease-out 1.4s both;
        }

        .signup-link a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s ease;
        }

        .signup-link a:hover {
            color: #764ba2;
        }

        .error-message {
            color: #e74c3c;
            font-size: 0.9rem;
            margin-top: 15px;
            padding: 10px;
            background: rgba(231, 76, 60, 0.1);
            border-radius: 8px;
            border-left: 4px solid #e74c3c;
            animation: fadeIn 0.3s ease-out;
        }

        .loading {
            display: none;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin-right: 10px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
            .login-container {
                padding: 30px 25px;
                margin: 10px;
            }
            
            .logo h1 {
                font-size: 2rem;
            }
        }
    `}
    </style>
    <div className="mainBlock">
      <div className="login-container">
        <div className="logo">
          <h1>GharBata</h1>
          <p>Service Delivery at Your Doorstep</p>
        </div>

        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Username</label>
            <input
              type="text"
              id="email"
              name="email"
              placeholder="Enter your email or phone number"
              value={username}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="forgot-password">
            <NavLink to="#" onClick={() => { }}>Forgot Password?</NavLink>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            <span className="btn-text">
              {loading ? "Signing In..." : "Sign In"}
            </span>
          </button>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </form>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <div className="social-login">
          <a href='http://localhost:5000/auth/google?userType=client' className="social-btn">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </a>
        </div>

        <div className="signup-link">
          Don't have an account? <NavLink to="/gharbata/signup">Sign up</NavLink>
        </div>
      </div>
    </div>
    <Toaster position="top-right" richColors />
  </>)
}

export default ClientLogin