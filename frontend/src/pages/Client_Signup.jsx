import React, { useState, useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import TermsAndCondition from "../components/TermsAndConditon"
import { toast } from 'sonner'
import { SignUp } from "../api/auth"

const Client_Signup = () => {

    const navigate = useNavigate()

    const [isOverlayOpen, setIsOverlayOpen] = useState(false)

    const [error, setError] = useState()

    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        username: '',
        password: '',
        userType: 'client'
    })

    const [agree, setAgree] = useState(false)
    const [isEveryFieldOkay,setIsEveryFieldOkay]=useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        const updatedData = { ...formData, [name]: value }

        setFormData(updatedData)

        const isValidName = (str) => /^[A-Za-z\s\-]+$/.test(str)

        const validatePassword = (password) => {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            return passwordRegex.test(password)
        }
        
        if (
            (name === "fname" || name === "lname") &&
            (!isValidName(updatedData.fname) || !isValidName(updatedData.lname))
        ) {
            setError("First and Last name must contain only alphabetic characters")
            setIsEveryFieldOkay(false)
        }

        else if ((name === "password") && (!validatePassword(updatedData.password))) {
            setError('Password must be at least 8 characters long and include at least one letter and one number.')
            setIsEveryFieldOkay(false)
        } else {
            setError("")
            setIsEveryFieldOkay(true)
        }
    }

    const handleCheckboxChange = (e) => {
        setAgree(e.target.checked)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!agree || !isEveryFieldOkay ) {
            toast.error("Please accept the terms and conditions.")
            return
        }

        try {

            sessionStorage.setItem('formData', JSON.stringify(formData))

            const username = formData.username
            const fname = formData.fname
            const lname = formData.lname
            const password = formData.password

            const rresult = await SignUp({ username, password, fname, lname })

            if (rresult.success) {
                navigate("/otp")
            }
            else{
                setError(rresult.msg)
            }

        } catch (error) {
            toast.error(error.message || "Registration failed.")
        }
    }

    return (
        <>
            <div className="background-shapes">
                <div className="shape"></div>
                <div className="shape"></div>
                <div className="shape"></div>
                <div className="shape"></div>
            </div>

            <div className="signup-container">
                <div className="header">
                    <h1>GharBata</h1>
                    <p>Create your account to unlock exclusive services and connect with trusted, certified professionals — all from the comfort of your home.</p>

                    <div className="features">
                        <div className="feature">
                            <div className="feature-icon">🏠</div>
                            <div className="feature-text">On-demand home services</div>
                        </div>
                        <div className="feature">
                            <div className="feature-icon">✅</div>
                            <div className="feature-text">Verified and skilled professionals</div>
                        </div>
                        <div className="feature">
                            <div className="feature-icon">📍</div>
                            <div className="feature-text">Real-time tracking & location-based matching</div>
                        </div>
                    </div>

                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input type="text" id="firstName" name="fname" placeholder="First Name" value={formData.fname} onChange={handleChange} required></input>
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input type="text" id="lastName" name="lname" placeholder="Last Name" value={formData.lname} onChange={handleChange} required></input>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="username" placeholder="xyz@gmail.com" value={formData.username} onChange={handleChange} required></input>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" placeholder="Create a strong password" value={formData.password} onChange={handleChange} required></input>
                    </div>

                    <div className="checkbox-group">
                        <input type="checkbox" id="terms" name="terms" checked={agree} onChange={handleCheckboxChange} required></input>
                        <label htmlFor="terms">
                            I agree to the <NavLink to="#" onClick={(event) => {
                                event.preventDefault()
                                setIsOverlayOpen(true)
                            }}>Terms of Service</NavLink> and <NavLink to="#" onClick={(event) => {
                                event.preventDefault()
                                setIsOverlayOpen(true)
                            }}>Privacy Policy</NavLink>
                        </label>
                    </div>

                    <button type="submit" className="signup-btn">Create Account</button>
                    {error && (
                        <p id="error-message" style={{ color: "red" }}>
                            {error}
                        </p>
                    )}

                </form>

                <div className="divider">
                    <span>or continue with</span>
                </div>


                <div className="social-buttons">
                    <button className="social-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>
                    <button className="social-btn" onClick={() => { }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                    </button>
                </div>

                <div className="login-link">
                    Already have an account? <NavLink to="/client_login">Sign in</NavLink>
                </div>
            </div>
            {isOverlayOpen && (
                <TermsAndCondition setIsOverlayOpen={setIsOverlayOpen}></TermsAndCondition>
            )}

            <style>
                {`

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            position: relative;
            overflow-x: hidden;
        }

        .background-shapes {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 1;
        }

        .shape {
            position: absolute;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            animation: float 6s ease-in-out infinite;
        }

        .shape:nth-child(1) {
            width: 80px;
            height: 80px;
            top: 20%;
            left: 10%;
            animation-delay: 0s;
        }

        .shape:nth-child(2) {
            width: 120px;
            height: 120px;
            top: 60%;
            left: 80%;
            animation-delay: 2s;
        }

        .shape:nth-child(3) {
            width: 60px;
            height: 60px;
            top: 80%;
            left: 20%;
            animation-delay: 4s;
        }

        .shape:nth-child(4) {
            width: 100px;
            height: 100px;
            top: 10%;
            right: 20%;
            animation-delay: 1s;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }

      .signup-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 22px;
            padding: 48px;
            width: 100%;
            max-width: 700px;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
            position: relative;
            z-index: 2;
        }

        @keyframes slideIn {
            from { 
                opacity: 0;
                transform: translateY(30px) scale(0.95);
            }
            to { 
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
        }

        .header h1 {
            font-size: 36px;
            font-weight: 800;
            color: #1a1a1a;
            margin-bottom: 12px;
            letter-spacing: -0.5px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header p {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
        }

        .features {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 32px;
        }

        .feature {
            text-align: center;
            padding: 16px 12px;
            background: rgba(102, 126, 234, 0.05);
            border-radius: 16px;
            border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .feature-icon {
            font-size: 24px;
            margin-bottom: 8px;
        }

        .feature-text {
            font-size: 12px;
            color: #666;
            font-weight: 500;
            line-height: 1.3;
        }

        .form-group {
            margin-bottom: 28px;
        }

        .form-group label {
            display: block;
            margin-bottom: 10px;
            font-weight: 600;
            color: #333;
            font-size: 15px;
        }

        .form-group input {
            width: 100%;
            padding: 18px 24px;
            border: 2px solid #e1e5e9;
            border-radius: 16px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.8);
        }

        .form-group input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
            transform: translateY(-2px);
        }

        .form-group input::placeholder {
            color: #999;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .checkbox-group {
            display: flex;
            justify-content:center;
            align-items: start;
            gap: 16px;
            margin-bottom: 32px;
        }

        .checkbox-group input[type="checkbox"] {
            width: 22px;
            height: 22px;
            margin-top: 2px;
            accent-color: #667eea;
        }

        .checkbox-group label {
            font-size: 14px;
            color: #666;
            line-height: 1.5;
            margin: 0;
            font-weight: 400;
        }

        .checkbox-group a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }

        .checkbox-group a:hover {
            text-decoration: underline;
        }

        .signup-btn {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 32px;
            position: relative;
            overflow: hidden;
        }

        .signup-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }

        .signup-btn:hover::before {
            left: 100%;
        }

        .signup-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
        }

        .signup-btn:active {
            transform: translateY(-1px);
        }

        .divider {
            text-align: center;
            margin: 32px 0;
            position: relative;
            color: #999;
            font-size: 14px;
            font-weight: 500;
        }

        .divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: #e1e5e9;
            z-index: 1;
        }

        .divider span {
            background: rgba(255, 255, 255, 0.95);
            padding: 0 20px;
            position: relative;
            z-index: 2;
        }

        .social-buttons {
            display: flex;
            justify-content:center;
            margin-bottom: 32px;
        }

        .social-btn {
            padding: 16px;
            width:100%;
            border: 2px solid #e1e5e9;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 16px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }

        .social-btn:hover {
            border-color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .login-link {
            text-align: center;
            color: #666;
            font-size: 15px;
        }

        .login-link a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }

        .login-link a:hover {
            text-decoration: underline;
        }

        @media (max-width: 768px) {
            .signup-container {
                padding: 32px 24px;
                margin: 10px;
            }
            
            .form-row {
                grid-template-columns: 1fr;
            }
            
            .features {
                grid-template-columns: 1fr;
                gap: 12px;
            }
            
            .social-buttons {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 28px;
            }
        }

        @media (max-width: 480px) {
            .features {
                display: none;
            }
            
            .signup-container {
                padding: 24px 20px;
            }
        }
      `}
            </style>
        </>
    )
}

export default Client_Signup