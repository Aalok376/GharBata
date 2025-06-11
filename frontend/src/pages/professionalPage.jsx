import React, { useState } from "react"
import styled from "styled-components"
import ClientNavbar from "../components/NavBarForClientAndProfessional"
import SideBar from "../components/SideBar"
import SideBarOverlay from "../components/SideBarOverlay"

const ProfessionalPage = () => {

    const [isSideBarOpen, setIsSideBarOpen] = useState(false)

    const Components = [
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
                          margin-left: 280px;
                          padding: 2rem;
                          overflow-y: auto;
                          transition: all 0.3s ease;
                          flex: 1;
                }
        
                .main-content.expanded {
                    margin-left: 0;
                }
        
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3rem;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    padding: 1.5rem 2rem;
                    border-radius: 20px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }
        
                .welcome {
                    color: #333;
                }
        
                .welcome h2 {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }
        
                .welcome p {
                    color: #666;
                    font-size: 1.1rem;
                }
        
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
        
                .status-badge {
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    background: rgba(46, 204, 113, 0.2);
                    color: #2ecc71;
                }
        
                .earnings-display {
                    text-align: center;
                    padding: 1rem;
                    background: rgba(52, 152, 219, 0.1);
                    border-radius: 15px;
                    color: #3498db;
                }
        
                .earnings-amount {
                    font-size: 1.5rem;
                    font-weight: 700;
                }
        
                .earnings-label {
                    font-size: 0.8rem;
                    opacity: 0.8;
                }
        
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 2rem;
                    margin-bottom: 3rem;
                }
        
                .stat-card {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }
        
                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
                }
        
                .stat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
        
                .stat-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: white;
                }
        
                .jobs-today .stat-icon {
                    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                }
        
                .total-earnings .stat-icon {
                    background: linear-gradient(135deg, #2ecc71, #27ae60);
                }
        
                .avg-rating .stat-icon {
                    background: linear-gradient(135deg, #f39c12, #e67e22);
                }
        
                .completion-rate .stat-icon {
                    background: linear-gradient(135deg, #9b59b6, #8e44ad);
                }
        
                .stat-value {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 0.5rem;
                }
        
                .stat-label {
                    color: #666;
                    font-size: 1rem;
                }
        
                .stat-change {
                    font-size: 0.8rem;
                    padding: 0.3rem 0.6rem;
                    border-radius: 10px;
                    margin-top: 0.5rem;
                }
        
                .positive {
                    background: rgba(46, 204, 113, 0.2);
                    color: #27ae60;
                }
        
                .negative {
                    background: rgba(231, 76, 60, 0.2);
                    color: #e74c3c;
                }
        
                .schedule-section {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    margin-bottom: 3rem;
                }
        
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
        
                .section-header h3 {
                    font-size: 1.5rem;
                    color: #333;
                }
        
                .add-appointment-btn {
                    background: linear-gradient(135deg, #1e3c72, #2a5298);
                    color: white;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
        
                .add-appointment-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(30, 60, 114, 0.4);
                }
        
                .appointment-item {
                    display: flex;
                    align-items: center;
                    padding: 1.5rem;
                    background: rgba(255, 255, 255, 0.7);
                    border-radius: 15px;
                    margin-bottom: 1rem;
                    transition: all 0.3s ease;
                    border-left: 4px solid transparent;
                }
        
                .appointment-item:hover {
                    transform: translateX(5px);
                    background: rgba(255, 255, 255, 0.9);
                }
        
                .appointment-item.urgent {
                    border-left-color: #e74c3c;
                }
        
                .appointment-item.scheduled {
                    border-left-color: #3498db;
                }
        
                .appointment-item.completed {
                    border-left-color: #2ecc71;
                }
        
                .appointment-time {
                    width: 80px;
                    text-align: center;
                    font-weight: 700;
                    color: #1e3c72;
                    margin-right: 2rem;
                }
        
                .appointment-details {
                    flex: 1;
                }
        
                .appointment-title {
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: #333;
                }
        
                .appointment-info {
                    color: #666;
                    font-size: 0.9rem;
                    display: flex;
                    gap: 1rem;
                }
        
                .appointment-actions {
                    display: flex;
                    gap: 0.5rem;
                }
        
                .action-btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.8rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
        
                .start-btn {
                    background: rgba(46, 204, 113, 0.2);
                    color: #27ae60;
                }
        
                .contact-btn {
                    background: rgba(52, 152, 219, 0.2);
                    color: #3498db;
                }
        
                .complete-btn {
                    background: rgba(155, 89, 182, 0.2);
                    color: #9b59b6;
                }
        
                .action-btn:hover {
                    transform: scale(1.05);
                }
        
                .quick-actions {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                }
        
                .quick-action-card {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border-radius: 15px;
                    padding: 2rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                }
        
                .quick-action-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
                    border-color: rgba(30, 60, 114, 0.3);
                }
        
                .quick-action-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    color: #1e3c72;
                }
        
                .quick-action-title {
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: #333;
                }
        
                .quick-action-desc {
                    color: #666;
                    font-size: 0.9rem;
                }
        
                .reviews-section {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    margin-top: 3rem;
                }
        
                .review-item {
                    padding: 1.5rem;
                    background: rgba(255, 255, 255, 0.7);
                    border-radius: 15px;
                    margin-bottom: 1rem;
                }
        
                .review-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
        
                .customer-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
        
                .customer-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #1e3c72, #2a5298);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                }
        
                .stars {
                    color: #f39c12;
                    font-size: 1.2rem;
                }
        
                .review-text {
                    color: #666;
                    line-height: 1.6;
                    font-style: italic;
                }
        
                @media (max-width: 768px) {
            
                        .dashboard {
                            grid-template-columns: 1fr;
                        }
            
                        .main-content {
                            margin-left: 0;
                        }
            
                        .stats-grid {
                            grid-template-columns: 1fr;
                        }
            
                        .appointment-item {
                            flex-direction: column;
                            align-items: flex-start;
                            gap: 1rem;
                }
    
                .appointment-time {
                    margin-bottom: 0;
                    margin-right: 0;
                }
    
                .appointment-info {
                    flex-direction: column;
                    gap: 0.5rem;
                }
    
                .header {
                    flex-direction: column;
                    gap: 1rem;
                    text-align: center;
                }
            }
        `}
            </style>
            <Body>
                <ClientNavbar isOpen={isSideBarOpen} setIsOpen={setIsSideBarOpen}></ClientNavbar>
                <SideBarOverlay isSideBarOpen={isSideBarOpen} setIsSideBarOpen={setIsSideBarOpen} />
                <div className="dashboard">
                    <SideBar components={Components} isOpen={isSideBarOpen}></SideBar>
                    <main className="main-content" id="mainContent">
                        <header className="header">
                            <div className="welcome">
                                <h2>Good morning, Michael!</h2>
                                <p>You have 5 appointments today</p>
                            </div>
                            <div className="header-actions">
                                <div className="status-badge">Available</div>
                                <div className="earnings-display">
                                    <div className="earnings-amount">$348</div>
                                    <div className="earnings-label">Today's Earnings</div>
                                </div>
                            </div>
                        </header>

                        <section className="stats-grid">
                            <div className="stat-card jobs-today">
                                <div className="stat-header">
                                    <div className="stat-icon">📋</div>
                                </div>
                                <div className="stat-value">5</div>
                                <div className="stat-label">Jobs Today</div>
                                <div className="stat-change positive">+2 from yesterday</div>
                            </div>

                            <div className="stat-card total-earnings">
                                <div className="stat-header">
                                    <div className="stat-icon">💵</div>
                                </div>
                                <div className="stat-value">$2,840</div>
                                <div className="stat-label">This Week</div>
                                <div className="stat-change positive">+15% from last week</div>
                            </div>

                            <div className="stat-card avg-rating">
                                <div className="stat-header">
                                    <div className="stat-icon">⭐</div>
                                </div>
                                <div className="stat-value">4.9</div>
                                <div className="stat-label">Average Rating</div>
                                <div className="stat-change positive">+0.1 this month</div>
                            </div>

                            <div className="stat-card completion-rate">
                                <div className="stat-header">
                                    <div className="stat-icon">✅</div>
                                </div>
                                <div className="stat-value">98%</div>
                                <div className="stat-label">Completion Rate</div>
                                <div className="stat-change positive">+2% this month</div>
                            </div>
                        </section>

                        <section className="schedule-section">
                            <div className="section-header">
                                <h3>Today's Schedule</h3>
                                <button className="add-appointment-btn" onClick={()=>{}}>+ Add Appointment</button>
                            </div>

                            <div className="appointment-item scheduled">
                                <div className="appointment-time">9:00 AM</div>
                                <div className="appointment-details">
                                    <div className="appointment-title">Kitchen Sink Repair</div>
                                    <div className="appointment-info">
                                        <span>📍 123 Oak Street, Downtown</span>
                                        <span>👤 Sarah Johnson</span>
                                        <span>💰 $85</span>
                                    </div>
                                </div>
                                <div className="appointment-actions">
                                    <button className="action-btn start-btn" onClick={()=>{}}>Start Job</button>
                                    <button className="action-btn contact-btn" onClick={()=>{}}>Contact</button>
                                </div>
                            </div>

                            <div className="appointment-item urgent">
                                <div className="appointment-time">11:30 AM</div>
                                <div className="appointment-details">
                                    <div className="appointment-title">Emergency Plumbing - Burst Pipe</div>
                                    <div className="appointment-info">
                                        <span>📍 456 Maple Ave, Westside</span>
                                        <span>👤 Robert Chen</span>
                                        <span>💰 $150</span>
                                    </div>
                                </div>
                                <div className="appointment-actions">
                                    <button className="action-btn start-btn" onClick={()=>{}}>Start Job</button>
                                    <button className="action-btn contact-btn" onClick={()=>{}}>Contact</button>
                                </div>
                            </div>

                            <div className="appointment-item scheduled">
                                <div className="appointment-time">2:00 PM</div>
                                <div className="appointment-details">
                                    <div className="appointment-title">Bathroom Faucet Installation</div>
                                    <div className="appointment-info">
                                        <span>📍 789 Pine St, Northside</span>
                                        <span>👤 Emily Davis</span>
                                        <span>💰 $120</span>
                                    </div>
                                </div>
                                <div className="appointment-actions">
                                    <button className="action-btn contact-btn" onClick={()=>{}}>Contact</button>
                                </div>
                            </div>

                            <div className="appointment-item completed">
                                <div className="appointment-time">4:30 PM</div>
                                <div className="appointment-details">
                                    <div className="appointment-title">Toilet Repair</div>
                                    <div className="appointment-info">
                                        <span>📍 321 Cedar Blvd, Eastside</span>
                                        <span>👤 Mark Wilson</span>
                                        <span>💰 $95</span>
                                    </div>
                                </div>
                                <div className="appointment-actions">
                                    <button className="action-btn complete-btn" onClick={()=>{}}>Mark
                                        Complete</button>
                                </div>
                            </div>
                        </section>

                        <section className="quick-actions">
                            <div className="quick-action-card" onClick={()=>{}}>
                                <div className="quick-action-icon">📋</div>
                                <div className="quick-action-title">View All Jobs</div>
                                <div className="quick-action-desc">Manage pending and completed jobs</div>
                            </div>

                            <div className="quick-action-card" onClick={()=>{}}>
                                <div className="quick-action-icon">🕐</div>
                                <div className="quick-action-title">Update Availability</div>
                                <div className="quick-action-desc">Set your working hours and days</div>
                            </div>

                            <div className="quick-action-card" onClick={()=>{}}>
                                <div className="quick-action-icon">💰</div>
                                <div className="quick-action-title">Earnings Report</div>
                                <div className="quick-action-desc">Track income and payments</div>
                            </div>

                            <div className="quick-action-card" onClick={()=>{}}>
                                <div className="quick-action-icon">💬</div>
                                <div className="quick-action-title">Customer Feedback</div>
                                <div className="quick-action-desc">View reviews and ratings</div>
                            </div>
                        </section>

                        <section className="reviews-section">
                            <div className="section-header">
                                <h3>Recent Customer Reviews</h3>
                                <a href="#" className="view-all-btn">View All Reviews</a>
                            </div>

                            <div className="review-item">
                                <div className="review-header">
                                    <div className="customer-info">
                                        <div className="customer-avatar">SJ</div>
                                        <div>
                                            <strong>Sarah Johnson</strong>
                                            <div className="stars">⭐⭐⭐⭐⭐</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="review-text">
                                    "Michael was fantastic! Fixed my kitchen sink quickly and professionally. Very clean work and
                                    fair pricing. Will definitely call again!"
                                </div>
                            </div>

                            <div className="review-item">
                                <div className="review-header">
                                    <div className="customer-info">
                                        <div className="customer-avatar">ED</div>
                                        <div>
                                            <strong>Emily Davis</strong>
                                            <div className="stars">⭐⭐⭐⭐⭐</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="review-text">
                                    "Excellent service! Arrived on time, explained everything clearly, and the new faucet works
                                    perfectly. Highly recommended!"
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </Body>
        </>

    )
}

const Body = styled.div` 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            min-height: 100vh;
            color: #333;`

export default ProfessionalPage