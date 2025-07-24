import React, { useState, useEffect } from "react"
import styled from "styled-components"
import ClientNavbar from "../components/NavBarForClientAndProfessional"
import SideBar from "../components/SideBar"
import SideBarOverlay from "../components/SideBarOverlay"
import ServiceCard from "../components/serviceCard"
import api from "../utils/api"

export const ClientPage = () => {
    const [isSideBarOpenC, setIsSideBarOpenC] = useState(false)
    const [services, setServices] = useState([])

    const Componentss = [
        { id: '/dashboard', icon: '📊', text: 'Dashboard' },
        { id: '/schedule', icon: '📋', text: 'My Orders' },
        { id: '/earnings', icon: '💰', text: 'Payment' },
        { id: '/favourites', icon: '⭐', text: 'Favourites' },
        { id: '/messages', icon: '📱', text: 'Messages' },
        { id: '/settings', icon: '⚙️', text: 'Settings' },
    ]

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await api.get("/api/services/active")
                setServices(res.data)
            } catch (error) {
                console.error("Error fetching services:", error)
            }
        }

        fetchServices()
    }, [])

    // Transform services data to match ServiceCard props
    const transformServices = (services) => {
        if (!Array.isArray(services)) return []
        
        return services.map(service => ({
            icon: service.icon || '🔧',
            header: service.category || service.name,
            description: service.description || '',
            services: service.services || []
        }))
    }

    const serviceCards = transformServices(services)

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
        
                .services-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 2rem;
                    margin-bottom: 3rem;
                }
        
                .recent-orders {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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
        
                .view-all-btn {
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
        
                .view-all-btn:hover {
                    color: #764ba2;
                }
        
                .order-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    background: rgba(255, 255, 255, 0.7);
                    border-radius: 15px;
                    margin-bottom: 1rem;
                    transition: all 0.3s ease;
                }
        
                .order-item:hover {
                    transform: translateX(5px);
                    background: rgba(255, 255, 255, 0.9);
                }
        
                .order-info {
                    flex: 1;
                }
        
                .order-title {
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: #333;
                }
        
                .order-details {
                    color: #666;
                    font-size: 0.9rem;
                }
        
                .order-status {
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    margin-left: 1rem;
                }
        
                .status-completed {
                    background: rgba(67, 233, 123, 0.2);
                    color: #43e97b;
                }
        
                .status-in-progress {
                    background: rgba(255, 193, 7, 0.2);
                    color: #ffc107;
                }
        
                .status-scheduled {
                    background: rgba(102, 126, 234, 0.2);
                    color: #667eea;
                }
        
                .quick-actions {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-top: 2rem;
                }
        
                .quick-action-btn {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border: none;
                    border-radius: 15px;
                    padding: 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: center;
                    color: #333;
                    font-weight: 600;
                }
        
                .quick-action-btn:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                }
        
                .quick-action-icon {
                    font-size: 2rem;
                    margin-bottom: 1rem;
                    color: #667eea;
                }
        
                @media (max-width: 768px) {
                    .dashboard {
                        grid-template-columns: 1fr;
                    }
                    
                    .main-content {
                        margin-left: 0;
                    }
                }
                `}
            </style>
            <CBody>
                <ClientNavbar isOpen={isSideBarOpenC} setIsOpen={setIsSideBarOpenC} />
                <SideBarOverlay isSideBarOpen={isSideBarOpenC} setIsSideBarOpen={setIsSideBarOpenC} />
                <div className="dashboard">
                    <SideBar components={Componentss} isOpen={isSideBarOpenC} />
                    <main className="main-content">
                        <header className="header">
                            <div className="welcome">
                                <h2>Welcome back, Sarah!</h2>
                                <p>Ready to book your next service?</p>
                            </div>
                        </header>
                        <section className="services-grid">
                            {serviceCards.length > 0 ? (
                                serviceCards.map((serviceGroup, idx) => (
                                    <ServiceCard
                                        key={idx}
                                        icon={serviceGroup.icon}
                                        header={serviceGroup.header}
                                        description={serviceGroup.description}
                                        services={serviceGroup.services}
                                    />
                                ))
                            ) : (
                                <p>Loading services...</p>
                            )}
                        </section>
                        <section className="recent-orders">
                            <div className="section-header">
                                <h3>Recent Orders</h3>
                                <a href="#" className="view-all-btn">View All</a>
                            </div>

                            <div className="order-item">
                                <div className="order-info">
                                    <div className="order-title">Deep House Cleaning</div>
                                    <div className="order-details">March 15, 2025 • Maria's Cleaning Service</div>
                                </div>
                                <div className="order-status status-completed">Completed</div>
                            </div>

                            <div className="order-item">
                                <div className="order-info">
                                    <div className="order-title">Kitchen Sink Repair</div>
                                    <div className="order-details">March 18, 2025 • QuickFix Plumbing</div>
                                </div>
                                <div className="order-status status-in-progress">In Progress</div>
                            </div>

                            <div className="order-item">
                                <div className="order-info">
                                    <div className="order-title">Garden Maintenance</div>
                                    <div className="order-details">March 22, 2025 • GreenThumb Landscaping</div>
                                </div>
                                <div className="order-status status-scheduled">Scheduled</div>
                            </div>
                        </section>

                        <section className="quick-actions">
                            <button className="quick-action-btn" onClick={() => { }}>
                                <div className="quick-action-icon">🚨</div>
                                Emergency Service
                            </button>
                            <button className="quick-action-btn" onClick={() => { }}>
                                <div className="quick-action-icon">🔄</div>
                                Repeat Last Order
                            </button>
                            <button className="quick-action-btn" onClick={() => { }}>
                                <div className="quick-action-icon">📅</div>
                                Schedule Regular
                            </button>
                            <button className="quick-action-btn" onClick={() => { }}>
                                <div className="quick-action-icon">💬</div>
                                Contact Support
                            </button>
                        </section>
                    </main>
                </div>
            </CBody>
        </>
    )
}

const CBody = styled.div`
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    min-height: 100vh;
    color: #333;
`
export default ClientPage;