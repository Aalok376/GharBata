import React,{useState,useEffect} from "react"

const Overlay_Otp=()=>{
    return(<>

    <style>
        {`.otp-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 1;
            transition: all 0.3s ease;
        }

       
        .otp-modal {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.15);
            padding: 50px 40px;
            width: 90%;
            max-width: 460px;
            position: relative;
            overflow: hidden;
            transform: scale(1) translateY(0);
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .otp-modal::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 5px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
            background-size: 300% 100%;
            animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
            0% { background-position: -300% 0; }
            100% { background-position: 300% 0; }
        }

        .otp-close {
            position: absolute;
            top: 20px;
            right: 25px;
            background: rgba(0, 0, 0, 0.1);
            border: none;
            font-size: 1.2rem;
            color: #666;
            cursor: pointer;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
        }

        .otp-close:hover {
            background: rgba(0, 0, 0, 0.2);
            color: #333;
            transform: rotate(90deg);
        }

        .otp-header {
            text-align: center;
            margin-bottom: 40px;
        }

        .otp-icon {
            width: 70px;
            height: 70px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 25px;
            animation: pulse 2.5s infinite;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }

        @keyframes pulse {
            0%, 100% { 
                transform: scale(1);
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
            }
            50% { 
                transform: scale(1.08);
                box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
            }
        }

        .otp-header h2 {
            font-size: 1.8rem;
            color: #333;
            margin-bottom: 12px;
            font-weight: 700;
        }

        .otp-header p {
            color: #666;
            font-size: 1rem;
            line-height: 1.6;
            margin-bottom: 8px;
        }

        .email_id {
            color: #667eea;
            font-weight: 700;
            font-size: 1.1rem;
        }

        .otp-inputs {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin: 35px 0;
        }

        .otp-input {
            width: 55px;
            height: 55px;
            border: 2px solid #e1e8ed;
            border-radius: 12px;
            text-align: center;
            font-size: 1.4rem;
            font-weight: 700;
            background: #f8fafc;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            outline: none;
        }

        .otp-input:focus {
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.12);
            transform: scale(1.05);
        }

        .otp-input.filled {
            border-color: #10b981;
            background: rgba(16, 185, 129, 0.08);
            color: #10b981;
        }

        .otp-input.error {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.08);
            color: #ef4444;
            animation: shake 0.6s ease-in-out;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
            20%, 40%, 60%, 80% { transform: translateX(3px); }
        }

        .otp-timer {
            text-align: center;
            margin: 25px 0;
            padding: 15px;
            background: rgba(102, 126, 234, 0.08);
            border-radius: 12px;
            border: 1px solid rgba(102, 126, 234, 0.15);
        }

        .timer-text {
            font-size: 0.95rem;
            color: #666;
            margin-right: 8px;
        }

        .timer-count {
            color: #667eea;
            font-weight: 700;
            font-size: 1.1rem;
        }

        .resend-section {
            text-align: center;
            margin: 25px 0;
        }

        .resend-text {
            font-size: 0.95rem;
            color: #666;
            margin-bottom: 10px;
        }

        .resend-btn {
            background: none;
            border: 2px solid #667eea;
            color: #667eea;
            font-weight: 600;
            cursor: pointer;
            font-size: 0.95rem;
            padding: 10px 20px;
            border-radius: 8px;
            transition: all 0.3s ease;
        }

        .resend-btn:hover:not(:disabled) {
            background: #667eea;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }

        .resend-btn:disabled {
            border-color: #d1d5db;
            color: #9ca3af;
            cursor: not-allowed;
        }

        .verify-btn {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 14px;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            margin-top: 20px;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.25);
        }

        .verify-btn:disabled {
            background: #d1d5db;
            cursor: not-allowed;
            box-shadow: none;
        }

        .verify-btn:not(:disabled):hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.35);
        }

        .verify-btn:not(:disabled):active {
            transform: translateY(-1px);
        }

        .verify-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
            transition: left 0.7s;
        }

        .verify-btn:not(:disabled):hover::before {
            left: 100%;
        }

        .otp-loading {
            display: none;
            width: 22px;
            height: 22px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s linear infinite;
            margin-right: 12px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .success-state {
            text-align: center;
            padding: 20px 0;
        }

        .success-icon {
            width: 60px;
            height: 60px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            animation: successPop 0.6s ease-out;
        }

        @keyframes successPop {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }

        .success-text {
            color: #10b981;
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 10px;
        }

        .success-subtext {
            color: #666;
            font-size: 0.95rem;
        }

        @media (max-width: 480px) {
            .otp-modal {
                padding: 40px 30px;
                margin: 20px;
            }

            .otp-inputs {
                gap: 10px;
            }

            .otp-input {
                width: 48px;
                height: 48px;
                font-size: 1.2rem;
            }

            .otp-header h2 {
                font-size: 1.5rem;
            }
        }`}
    </style>
        <div className="otp-overlay" id="otpOverlay">
        <div className="otp-modal" id="otpModal">
            <button className="otp-close" onClick={()=>{}}>&times;</button>
            
            <div className="otp-header">
                <div className="otp-icon">
                    <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                        <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>
                    </svg>
                </div>
                <h2>Verify Your Account</h2>
                <p>We've sent a 6-digit verification code to</p>
                <div className="email_id" id="phoneDisplay">xyz@gmail.com</div>
            </div>

            <div className="otp-inputs">
                <input type="text" className="otp-input" maxlength="1" inputmode="numeric" pattern="[0-9]"></input>
                <input type="text" className="otp-input" maxlength="1" inputmode="numeric" pattern="[0-9]"></input>
                <input type="text" className="otp-input" maxlength="1" inputmode="numeric" pattern="[0-9]"></input>
                <input type="text" className="otp-input" maxlength="1" inputmode="numeric" pattern="[0-9]"></input>
                <input type="text" className="otp-input" maxlength="1" inputmode="numeric" pattern="[0-9]"></input>
                <input type="text" className="otp-input" maxlength="1" inputmode="numeric" pattern="[0-9]"></input>
            </div>

            <div className="otp-timer">
                <span className="timer-text">Code expires in</span>
                <span className="timer-count" id="timerCount">03:00</span>
            </div>

            <div className="resend-section">
                <div className="resend-text">Didn't receive the code?</div>
                <button className="resend-btn" id="resendBtn" onClick={()=>{}}>Resend Code</button>
            </div>

            <button className="verify-btn" id="verifyBtn" onClick={()=>{}} disabled>
                <span className="otp-loading"></span>
                <span className="verify-btn-text">Verify Code</span>
            </button>
        </div>
    </div>
    </>)
}

export default Overlay_Otp