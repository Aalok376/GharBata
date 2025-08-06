import React, { useEffect } from "react";

const TermsAndCondition = ({ setIsOverlayOpen }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      <style>
        {`
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(6px);
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
          background: #ffffff;
          box-shadow: 0 -20px 40px rgba(0, 0, 0, 0.25);
          transform: translateY(100%);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          max-height: 70vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .overlay .terms-container {
          transform: translateY(0);
        }

        .terms-header {
          padding: 25px 30px 15px;
          border-bottom: 1px solid #e0e0e0;
          background: #f9fafb;
          border-radius: 20px 20px 0 0;
        }

        .drag-handle {
          width: 40px;
          height: 4px;
          background: #cbd5e0;
          border-radius: 2px;
          margin: 0 auto 20px;
          cursor: grab;
        }

        .terms-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 5px;
        }

        .terms-subtitle {
          color: #64748b;
          font-size: 0.9rem;
        }

        .close-btn {
          position: absolute;
          top: 25px;
          right: 25px;
          background: #e2e8f0;
          border: none;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          color: #475569;
          font-size: 1.2rem;
        }

        .close-btn:hover {
          background: #cbd5e1;
          color: #1e293b;
          transform: scale(1.05);
        }

        .terms-content {
          padding: 30px;
          overflow-y: auto;
          flex: 1;
          line-height: 1.6;
          color: #334155;
        }

        .terms-content h2 {
          color: #1e293b;
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
          background: linear-gradient(120deg, #3b82f6, #6366f1);
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
          .terms-content {
            padding-left: 20px;
            padding-right: 20px;
          }
        }
      `}
      </style>

      <div className="overlay" onClick={() => setIsOverlayOpen(false)}>
        <div className="terms-container" onClick={(e) => e.stopPropagation()}>
          <div className="terms-header">
            <button className="close-btn" onClick={() => setIsOverlayOpen(false)}>&times;</button>
            <h2 className="terms-title">Terms & Conditions</h2>
            <p className="terms-subtitle">Last updated: August 6, 2025</p>
          </div>

          <div className="terms-content">
            <h2>1. <span className="highlight">Introduction</span></h2>
            <p>This agreement outlines the terms under which clients and technicians interact using our In-Home Service Delivery App ("the Platform"). By using the Platform, you agree to comply with these terms.</p>

            <h2>2. <span className="highlight">User Responsibilities</span></h2>
            <ul>
              <li>Clients must provide accurate service requests and be available at the specified location/time.</li>
              <li>Technicians must arrive promptly for bookings they accept.</li>
              <li>All users must behave respectfully and maintain professionalism.</li>
            </ul>

            <h2>3. <span className="highlight">Payments and Cancellations</span></h2>
            <p>All payments must be made through our secure gateway. Cancellations within 1 hour of service may be subject to a fee.</p>

            <h2>4. <span className="highlight">Account Termination</span></h2>
            <p>We reserve the right to suspend or terminate accounts that violate our policies, including fraud, abuse, or repeated cancellations.</p>

            <h2>5. <span className="highlight">Privacy Policy</span></h2>
            <p>We value your privacy. Here's how we handle your data:</p>
            <ul>
              <li>We collect only the necessary information to provide our services (e.g., name, location, contact details).</li>
              <li>We never sell your data to third parties.</li>
              <li>Your location data is used only for service delivery and technician routing.</li>
              <li>All sensitive data is encrypted and stored securely.</li>
            </ul>

            <h2>6. <span className="highlight">Dispute Resolution</span></h2>
            <p>If any dispute arises between a client and technician, our support team will intervene and mediate based on provided evidence.</p>

            <h2>7. <span className="highlight">Modifications</span></h2>
            <p>We may update these Terms occasionally. Continued use of the platform indicates acceptance of any changes.</p>

            <h2>8. <span className="highlight">Contact Us</span></h2>
            <p>If you have any questions, feedback, or concerns, feel free to reach out at treasuretracker8@gmail.com.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsAndCondition