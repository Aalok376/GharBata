import React, { useState } from "react"
import ClientNavbar from "../components/NavBarForClientAndProfessional"
import SideBar from "../components/SideBar"
import SideBarOverlay from "../components/SideBarOverlay"

const ProfessionalProfilePage = () => {

    const [isSideBarOpenP, setIsSideBarOpenP] = useState(false)

    const PComponents = [
        { id: '/dashboard', icon: '📊', text: 'Dashboard' },
        { id: '/schedule', icon: '📅', text: 'Schedule' },
        { id: '/jobs', icon: '💼', text: 'Jobs' },
        { id: '/customers', icon: '👥', text: 'Customers' },
        { id: '/earnings', icon: '💰', text: 'Earnings' },
        { id: '/reviews', icon: '⭐', text: 'Reviews' },
        { id: '/messages', icon: '📱', text: 'Messages' },
        { id: '/settings', icon: '⚙️', text: 'Settings' },
    ]

    return (
        <>
            <style>
                {`
             .dashboard {
                           display: flex;
                           grid-template-columns: 280px 1fr;
                           margin-top: 70px;
                           min-height: calc(100vh - 70px);
                        }
        
                .main-content {
                          margin-top:20px;
                          margin-left: 280px;
                          padding: 2rem;
                          overflow-y: auto;
                          transition: all 0.3s ease;
                          flex: 1;
                          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.5rem 0.5rem;
                    border-radius: 20px;
                }
        
                .page-title h2 {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                    color: #333;
                }
        
                .page-title p {
                    color: #666;
                    font-size: 1.1rem;
                }
        
                .save-changes-btn {
                    background: linear-gradient(135deg, #2ecc71, #27ae60);
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }
        
                .save-changes-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
                }
        
                .profile-grid {
                    display: flex;
                    margin-bottom: 3rem;
                }
        
                .profile-card {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    height: fit-content;
                    position: fixed;
                }
        
                .profile-photo {
                    position: relative;
                    margin-bottom: 2rem;
                }
        
                .profile-avatar {
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #1e3c72, #2a5298);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 3rem;
                    font-weight: 700;
                    margin: 0 auto;
                    position: relative;
                    overflow: hidden;
                }
        
                .photo-upload-btn {
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #2ecc71;
                    color: white;
                    border: none;
                    cursor: pointer;
                    font-size: 1.2rem;
                    transition: all 0.3s ease;
                }
        
                .photo-upload-btn:hover {
                    transform: scale(1.1);
                    background: #27ae60;
                }
        
                .profile-name {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 0.5rem;
                }
        
                .profile-specialty {
                    color: #1e3c72;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }
        
                .profile-rating {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-bottom: 2rem;
                }
        
                .stars {
                    color: #f39c12;
                    font-size: 1.2rem;
                }
        
                .rating-text {
                    color: #666;
                    font-size: 0.9rem;
                }
        
                .profile-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
        
                .stat-item {
                    text-align: center;
                    padding: 1rem;
                    background: rgba(30, 60, 114, 0.1);
                    border-radius: 15px;
                }
        
                .stat-number {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1e3c72;
                }
        
                .stat-label {
                    font-size: 0.8rem;
                    color: #666;
                    margin-top: 0.5rem;
                }
        
                .verification-badges {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    justify-content: center;
                }
        
                .badge {
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
        
                .verified {
                    background: rgba(46, 204, 113, 0.2);
                    color: #27ae60;
                }
        
                .licensed {
                    background: rgba(52, 152, 219, 0.2);
                    color: #3498db;
                }
        
                .insured {
                    background: rgba(155, 89, 182, 0.2);
                    color: #9b59b6;
                }
        
                .makeItScrollable {
                    margin-left: 400px;
                    position: fixed;
                    height: 76%;
                    width: 52%;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    gap: zero;
                    border-radius: 20px;
                }
        
                .form-sections {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    flex: 1;
                    overflow-y: auto;
                    padding-right: 12px;
                    margin-right: 16px;
                }
        
                .form-section {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }
        
                .section-header {
                    display: flex;
                    justify-content: between;
                    align-items: center;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid rgba(30, 60, 114, 0.1);
                }
        
                .section-title {
                    font-size: 1.3rem;
                    font-weight: 600;
                    color: #333;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
        
                .section-icon {
                    font-size: 1.5rem;
                    color: #1e3c72;
                }
        
                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
        
                .form-group {
                    display: flex;
                    flex-direction: column;
                }
        
                .form-label {
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                }
        
                .form-input {
                    padding: 1rem;
                    border: 2px solid rgba(30, 60, 114, 0.1);
                    border-radius: 10px;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    background: rgba(255, 255, 255, 0.8);
                }
        
                .form-input:focus {
                    outline: none;
                    border-color: #1e3c72;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(30, 60, 114, 0.1);
                }
        
                .form-textarea {
                    min-height: 120px;
                    resize: vertical;
                }
        
                .form-select {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right 0.5rem center;
                    background-repeat: no-repeat;
                    background-size: 1.5em 1.5em;
                    padding-right: 2.5rem;
                }
        
                .skills-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-top: 1rem;
                }
        
                .skill-tag {
                    padding: 0.5rem 1rem;
                    background: rgba(30, 60, 114, 0.1);
                    color: #1e3c72;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
        
                .skill-tag:hover {
                    background: rgba(30, 60, 114, 0.2);
                    transform: scale(1.05);
                }
        
                .remove-skill {
                    color: #e74c3c;
                    cursor: pointer;
                    font-weight: bold;
                }
        
                .add-skill-btn {
                    padding: 0.5rem 1rem;
                    background: rgba(46, 204, 113, 0.2);
                    color: #27ae60;
                    border: 2px dashed #27ae60;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
        
                .add-skill-btn:hover {
                    background: rgba(46, 204, 113, 0.3);
                    transform: scale(1.05);
                }
        
                .availability-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 1rem;
                    margin-top: 1rem;
                }
        
                .day-availability {
                    text-align: center;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 15px;
                    border: 2px solid transparent;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
        
                .day-availability.active {
                    border-color: #1e3c72;
                    background: rgba(30, 60, 114, 0.1);
                }
        
                .day-name {
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 0.5rem;
                }
        
                .day-hours {
                    font-size: 0.8rem;
                    color: #666;
                }
        
                /* Portfolio Section */
                .portfolio-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-top: 1rem;
                }
        
                .portfolio-item {
                    position: relative;
                    aspect-ratio: 1;
                    background: rgba(30, 60, 114, 0.1);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    overflow: hidden;
                }
        
                .portfolio-item:hover {
                    transform: scale(1.05);
                }
        
                .portfolio-placeholder {
                    color: #1e3c72;
                    font-size: 2rem;
                }
        
                .add-portfolio-btn {
                    border: 2px dashed #1e3c72;
                    background: rgba(30, 60, 114, 0.05);
                }
        
                .add-portfolio-btn:hover {
                    background: rgba(30, 60, 114, 0.1);
                }
        
                /* Toggle Switch */
                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 60px;
                    height: 34px;
                }
        
                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
        
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                    border-radius: 34px;
                }
        
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 26px;
                    width: 26px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
        
                input:checked+.slider {
                    background-color: #1e3c72;
                }
        
                input:checked+.slider:before {
                    transform: translateX(26px);
                }
        
                @media (max-width: 1024px) {
                    .profile-grid {
                        grid-template-columns: 1fr;
                    }
                }
        
                @media (max-width: 768px) {
                    .dashboard {
                        display:grid;
                        grid-template-columns: 1fr;
                    }

                    .profile-grid{
                    display:grid;
                    }

                    .profile-card{
                    position:static;
                    height:auto;
                    }

                    .makeItScrollable{
                    margin-top:30px;
                    position:static;
                    margin-left: 0px;
                    height:auto;
                    width:auto;
                    }

                    .form-sections{
                    margin-right:0px;
                    padding-right:0px;
                    }
        
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
        
                    .availability-grid {
                        grid-template-columns: 1fr;
                    }
                    .main-content {
                            margin-left: 0;
                    }
                }
    
            `}
            </style>
            <ClientNavbar isOpen={isSideBarOpenP} setIsOpen={setIsSideBarOpenP}></ClientNavbar>
            <SideBarOverlay isSideBarOpen={isSideBarOpenP} setIsSideBarOpen={setIsSideBarOpenP} />
            <div className="dashboard">
                <SideBar components={PComponents} isOpen={isSideBarOpenP}></SideBar>
                <main className="main-content">

                    <div className="profile-grid">

                        <div className="profile-card">
                            <div className="profile-photo">
                                <div className="profile-avatar">MS</div>
                                <button className="photo-upload-btn" onClick={() => { }}>📷</button>
                            </div>

                            <div className="profile-name">Michael Smith</div>
                            <div className="profile-specialty">Licensed Plumber</div>

                            <div className="profile-rating">
                                <div className="stars">⭐⭐⭐⭐⭐</div>
                                <span className="rating-text">4.9 (127 reviews)</span>
                            </div>

                            <div className="profile-stats">
                                <div className="stat-item">
                                    <div className="stat-number">245</div>
                                    <div className="stat-label">Jobs Completed</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">3.2</div>
                                    <div className="stat-label">Years Experience</div>
                                </div>
                            </div>

                            <div className="verification-badges">
                                <span className="badge verified">✓ ID Verified</span>
                                <span className="badge licensed">✓ Licensed</span>
                                <span className="badge insured">✓ Insured</span>
                            </div>
                        </div>


                        <div className="makeItScrollable">
                            <div className="form-sections">

                                <div className="form-section">
                                    <header className="header">
                                        <div className="page-title">
                                            <h2>Professional Profile</h2>
                                            <p>Manage your business information and credentials</p>
                                        </div>
                                        <button className="save-changes-btn" onClick={() => { }}>Save Changes</button>
                                    </header>
                                </div>

                                <div className="form-section">
                                    <div className="section-header">
                                        <div className="section-title">
                                            <span className="section-icon">👤</span>
                                            Personal Information
                                        </div>
                                    </div>

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">First Name</label>
                                            <input type="text" className="form-input"
                                                placeholder="Enter first name"></input>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Last Name</label>
                                            <input type="text" className="form-input" placeholder="Enter last name"></input>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Phone Number</label>
                                            <input type="tel" className="form-input"
                                                placeholder="Enter phone number"></input>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Email Address</label>
                                            <input type="email" className="form-input"
                                                placeholder="Enter email address"></input>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Business Name</label>
                                            <input type="text" className="form-input"
                                                placeholder="Enter business name"></input>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Years of Experience</label>
                                            <select className="form-input form-select">
                                                <option>Less than 1 year</option>
                                                <option>1-2 years</option>
                                                <option >3-5 years</option>
                                                <option>5-10 years</option>
                                                <option>10+ years</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <div className="section-header">
                                        <div className="section-title">
                                            <span className="section-icon">🔧</span>
                                            Professional Details
                                        </div>
                                    </div>

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Primary Service Category</label>
                                            <select className="form-input form-select">
                                                <option>Plumbing</option>
                                                <option>Electrical</option>
                                                <option>HVAC</option>
                                                <option>Handyman</option>
                                                <option>Cleaning</option>
                                                <option>Gardening</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">License Number</label>
                                            <input type="text" className="form-input"
                                                placeholder="Enter license number"></input>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Insurance Provider</label>
                                            <input type="text" className="form-input"
                                                placeholder="Enter insurance provider"></input>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Hourly Rate ($)</label>
                                            <input type="number" className="form-input" placeholder="Enter hourly rate"></input>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Professional Bio</label>
                                        <textarea className="form-input form-textarea"
                                            placeholder="Tell customers about your experience, specialties, and what makes you unique..."></textarea>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Skills & Specialties</label>
                                        <div className="skills-container">
                                            <span className="skill-tag">Pipe Repair <span className="remove-skill"
                                                onClick={() => { }}>×</span></span>
                                            <span className="skill-tag">Drain Cleaning <span className="remove-skill"
                                                onClick={() => { }}>×</span></span>
                                            <span className="skill-tag">Water Heater Installation <span className="remove-skill"
                                                onClick={() => { }}>×</span></span>
                                            <span className="skill-tag">Emergency Repairs <span className="remove-skill"
                                                onClick={() => { }}>×</span></span>
                                            <span className="skill-tag">Bathroom Renovation <span className="remove-skill"
                                                onClick={() => { }}>×</span></span>
                                            <button className="add-skill-btn" onClick={() => { }}>+ Add Skill</button>
                                        </div>
                                    </div>
                                </div>


                                <div className="form-section">
                                    <div className="section-header">
                                        <div className="section-title">
                                            <span className="section-icon">📍</span>
                                            Service Area & Availability
                                        </div>
                                    </div>

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Primary Service Area</label>
                                            <input type="text" className="form-input"
                                                placeholder="Enter service areas"></input>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Maximum Travel Distance (miles)</label>
                                            <input type="number" className="form-input"
                                                placeholder="Enter maximum distance"></input>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Emergency Services Available</label>
                                            <label className="toggle-switch">
                                                <input type="checkbox" ></input>
                                                <span className="slider"></span>

                                            </label>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Weekend Availability</label>
                                            <label className="toggle-switch">
                                                <input type="checkbox"></input>
                                                <span className="slider"></span>

                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Weekly Availability</label>
                                        <div className="availability-grid">
                                            <div className="day-availability active" onClick={() => { }}>
                                                <div className="day-name">Mon</div>
                                                <div className="day-hours">8AM-6PM</div>
                                            </div>
                                            <div className="day-availability active" onClick={() => { }}>
                                                <div className="day-name">Tue</div>
                                                <div className="day-hours">8AM-6PM</div>
                                            </div>
                                            <div className="day-availability active" onClick={() => { }}>
                                                <div className="day-name">Wed</div>
                                                <div className="day-hours">8AM-6PM</div>
                                            </div>
                                            <div className="day-availability active" onClick={() => { }}>
                                                <div className="day-name">Thu</div>
                                                <div className="day-hours">8AM-6PM</div>
                                            </div>
                                            <div className="day-availability active" onClick={() => { }}>
                                                <div className="day-name">Fri</div>
                                                <div className="day-hours">8AM-6PM</div>
                                            </div>
                                            <div className="day-availability active" onClick={() => { }}>
                                                <div className="day-name">Sat</div>
                                                <div className="day-hours">9AM-3PM</div>
                                            </div>
                                            <div className="day-availability" onClick={() => { }}>
                                                <div className="day-name">Sun</div>
                                                <div className="day-hours">Closed</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <div className="section-header">
                                        <div className="section-title">
                                            <span className="section-icon">📸</span>
                                            Work Portfolio
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Showcase Your Best Work</label>
                                        <div className="portfolio-grid">
                                            <div className="portfolio-item">
                                                <div className="portfolio-placeholder">🚿</div>
                                            </div>
                                            <div className="portfolio-item">
                                                <div className="portfolio-placeholder">🔧</div>
                                            </div>
                                            <div className="portfolio-item">
                                                <div className="portfolio-placeholder">🚰</div>
                                            </div>
                                            <div className="portfolio-item add-portfolio-btn" onClick={() => { }}>
                                                <div className="portfolio-placeholder">+</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <div className="section-header">
                                        <div className="section-title">
                                            <span className="section-icon">⚙️</span>
                                            Account Settings
                                        </div>
                                    </div>

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Profile Visibility</label>
                                            <select className="form-input form-select">
                                                <option >Public - Anyone can find me</option>
                                                <option>Private - Only invited customers</option>
                                                <option>Limited - Verified customers only</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Instant Booking</label>
                                            <label className="toggle-switch">
                                                <input type="checkbox"></input>
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>

        </>
    )
}

export default ProfessionalProfilePage