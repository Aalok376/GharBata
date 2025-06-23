import React,{useEffect} from "react"

const TermsAndCondition = ({ setIsOverlayOpen }) => {

    useEffect(() => {
        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow = ''
        }
    }, [])
    return (
        <>
            <style>
                {` .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            z-index: 1000;
            opacity: 1;
            visibility: visible;
            transition: all 0.3s ease;
        }

        .terms-container {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            box-shadow: 0 -20px 40px rgba(0, 0, 0, 0.3);
            transform: translateY(100%);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            max-height: 60vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .overlay .terms-container {
            transform: translateY(0);
        }

        .terms-header {
            padding: 25px 30px 15px;
            border-bottom: 1px solid #e5e7eb;
            position: relative;
            background: #f8fafc;
            border-radius: 25px 25px 0 0;
        }

        .drag-handle {
            width: 40px;
            height: 4px;
            background: #d1d5db;
            border-radius: 2px;
            margin: 0 auto 20px;
            cursor: grab;
        }

        .terms-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 5px;
        }

        .terms-subtitle {
            color: #6b7280;
            font-size: 0.9rem;
        }

        .close-btn {
            position: absolute;
            top: 25px;
            right: 25px;
            background: #f3f4f6;
            border: none;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            color: #6b7280;
            font-size: 1.2rem;
        }

        .close-btn:hover {
            background: #e5e7eb;
            color: #374151;
            transform: scale(1.05);
        }

        .terms-content {
            padding: 30px;
            overflow-y: auto;
            flex: 1;
            line-height: 1.7;
            color: #374151;
        }

        .terms-content h2 {
            color: #1f2937;
            margin: 25px 0 15px 0;
            font-size: 1.2rem;
            font-weight: 600;
        }

        .terms-content h2:first-child {
            margin-top: 0;
        }

        .terms-content p {
            margin-bottom: 15px;
        }

        .terms-content ul {
            margin: 15px 0;
            padding-left: 20px;
        }

        .terms-content li {
            margin-bottom: 8px;
        }

        .highlight {
            background: linear-gradient(120deg, #a78bfa 0%, #ec4899 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 600;
        }
        @media (max-width: 768px) {
            .terms-container {
                max-height: 95vh;
            }
            
            .terms-header,
            .terms-content,
            .terms-footer {
                padding-left: 20px;
                padding-right: 20px;
            }
            
            .terms-footer {
                flex-direction: column;
            }
        }`}
            </style>

            <div className="overlay" id="termsOverlay" onClick={() => setIsOverlayOpen(false)}>
                <div className="terms-container">
                    <div className="terms-header">
                        <button className="close-btn" onClick={() => setIsOverlayOpen(false)}>&times;</button>
                        <h2 className="terms-title">Terms & Conditions</h2>
                        <p className="terms-subtitle">Last updated: June 21, 2025</p>
                    </div>

                    <div className="terms-content">
                        <h2>1. <span className="highlight">Agreement to Terms</span></h2>
                        <p>By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement. These Terms of Service are effective immediately upon your use of the service.</p>

                        <h2>2. <span className="highlight">Use License</span></h2>
                        <p>Permission is granted to temporarily use this service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                        <ul>
                            <li>Modify or copy the materials</li>
                            <li>Use the materials for any commercial purpose or for any public display</li>
                            <li>Attempt to reverse engineer any software contained in the service</li>
                            <li>Remove any copyright or other proprietary notations from the materials</li>
                        </ul>

                        <h2>3. <span className="highlight">Privacy Policy</span></h2>
                        <p>Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our service. By using our service, you agree to the collection and use of information in accordance with our Privacy Policy.</p>

                        <h2>4. <span className="highlight">User Accounts</span></h2>
                        <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for any activities that occur under your account.</p>

                        <h2>5. <span className="highlight">Prohibited Uses</span></h2>
                        <p>You may not use our service for any unlawful purpose or to solicit others to perform unlawful acts. You may not transmit any worms or viruses or any code of a destructive nature.</p>

                        <h2>6. <span className="highlight">Content</span></h2>
                        <p>Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post to the service.</p>

                        <h2>7. <span className="highlight">Termination</span></h2>
                        <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

                        <h2>8. <span className="highlight">Changes to Terms</span></h2>
                        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.</p>

                        <h2>9. <span className="highlight">Contact Information</span></h2>
                        <p>If you have any questions about these Terms and Conditions, please contact us at legal@example.com</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TermsAndCondition