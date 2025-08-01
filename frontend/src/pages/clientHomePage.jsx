import React, { useState, useEffect } from "react"
import styled from "styled-components"
import ClientNavbar from "../components/NavBarForClientAndProfessional"
import SideBar from "../components/SideBar"
import SideBarOverlay from "../components/SideBarOverlay"
import ServiceCard from "../components/serviceCard"
import { useParams, useNavigate } from 'react-router-dom'


const ClientPage = () => {
    const [isSideBarOpenC, setIsSideBarOpenC] = useState(false)
    const [fname, setFname] = useState('')
    const [lname, setLname] = useState('')
    const [profilePic, setProfilePic] = useState('')
    const [userId, setUserId] = useState('')
    const [clientId, setclientId] = useState('')
    const navigate = useNavigate()

    const Components = [
        { id: `/client/dashboard`, icon: '📊', text: 'Dashboard' },
        { id: `/client/orders/${clientId}`, icon: '📋', text: 'My Orders' },
        { id: `/client/earnings/${clientId}`, icon: '💰', text: 'Payment' },
        { id: `/dashboard/chats/${userId}`, icon: '📱', text: 'Messages' },
        { id: '/logout', icon: '⚙️', text: 'Logout' },
    ]

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileResponse = await fetch('http://localhost:5000/api/clients/getClientProfile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify()
                })

                let profileData = await profileResponse.json()
                profileData = Array.isArray(profileData) ? profileData : [profileData]

                const prof = profileData[0]?.user || {}
                const profData = prof?.client_id

                if (profData) {
                    setFname(profData.fname || '')
                    setLname(profData.lname || '')
                    setUserId(profData._id || '')
                }

                setclientId(prof?._id)
                setProfilePic(prof?.profilePic || '')

            } catch (err) {
                console.error('Failed to fetch profile:', err)
            }
        }

        fetchProfile()
    }, [])

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/logoutuser', {
                method: 'GET',
                credentials: 'include',
            })
            const data = await response.json()

            if (data.success) {
                sessionStorage.clear()
                // Navigate to login page and replace history so user can't go back
                navigate('/gharbata/login', { replace: true })
                window.location.reload()
            } else {
                alert('Logout failed: ' + data.msg)
            }
        } catch (error) {
            console.error('Logout error:', error)
        }
    }
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
                    justify-content: between;
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
                <ClientNavbar isOpen={isSideBarOpenC} setIsOpen={setIsSideBarOpenC} fname={fname} lname={lname} profilePic={profilePic} userType={'client'} userId={userId}></ClientNavbar>
                <SideBarOverlay isSideBarOpen={isSideBarOpenC} setIsSideBarOpen={setIsSideBarOpenC} />
                <div className="dashboard">
                    <SideBar components={Components} isOpen={isSideBarOpenC} onLogout={handleLogout}></SideBar>
                    <main className="main-content">
                        <header className="header">
                            <div className="welcome">
                                <h2>Welcome back, {fname}!</h2>
                                <p>Ready to book your next service?</p>
                            </div>
                        </header>
                        <section className="services-grid">
                            <ServiceCard
                                icon='🚰'
                                header={'Plumber'}
                                description={'Installation, repair, and maintenance of water pipes, faucets, drains, and sewage systems'}
                                services={[
                                    { id: 1, name: 'Leak Repairs' },
                                    { id: 2, name: 'Pipe Installation' },
                                    { id: 3, name: 'Clog Removal' },
                                    { id: 4, name: 'Water Heater Setup' }
                                ]}>
                            </ServiceCard>

                            <ServiceCard
                                icon='💡'
                                header={'Electrician'}
                                description={'Handles electrical systems, wiring, outlets, lighting, and appliance connections'}
                                services={[
                                    { id: 1, name: 'Wiring & Rewiring' },
                                    { id: 2, name: 'Light Fixture Installation' },
                                    { id: 3, name: 'Circuit Breaker Repair' },
                                    { id: 4, name: 'Fan Installation' }
                                ]}>
                            </ServiceCard>

                            <ServiceCard
                                icon='❄️'
                                header={'HVAC Technician'}
                                description={'Installs and services heating, ventilation, and air conditioning systems'}
                                services={[
                                    { id: 1, name: 'AC Maintenance' },
                                    { id: 2, name: 'Furnace Repair' },
                                    { id: 3, name: 'Air Filter Replacement' },
                                    { id: 4, name: 'Thermostat Setup' }
                                ]}>
                            </ServiceCard>

                            <ServiceCard
                                icon='🧰'
                                header={'Handyman'}
                                description={'Versatile professional for general home repairs and maintenance tasks'}
                                services={[
                                    { id: 1, name: 'Wall Fixes' },
                                    { id: 2, name: 'Minor Plumbing Work' },
                                    { id: 3, name: 'Shelving & Fixtures' },
                                    { id: 4, name: 'Gutter Cleaning' }
                                ]}>
                            </ServiceCard>

                            <ServiceCard
                                icon='🧽'
                                header={'Cleaner'}
                                description={'Performs deep cleaning, routine maintenance, and sanitization for homes and offices'}
                                services={[
                                    { id: 1, name: 'Kitchen Cleaning' },
                                    { id: 2, name: 'Bathroom Cleaning' },
                                    { id: 3, name: 'Window Cleaning' },
                                    { id: 4, name: 'Deep Floor Cleaning' }
                                ]}>
                            </ServiceCard>

                            <ServiceCard
                                icon='🌿'
                                header={'Gardener'}
                                description={'Maintains lawns, gardens, plants, and landscaping features'}
                                services={[
                                    { id: 1, name: 'Lawn Mowing' },
                                    { id: 2, name: 'Hedge Trimming' },
                                    { id: 3, name: 'Planting & Watering' },
                                    { id: 4, name: 'Weed Removal' }
                                ]}>
                            </ServiceCard>

                            <ServiceCard
                                icon='🪚'
                                header={'Carpenter'}
                                description={'Works with wood to build, install, and repair furniture, doors, and structures'}
                                services={[
                                    { id: 1, name: 'Furniture Repair' },
                                    { id: 2, name: 'Custom Shelving' },
                                    { id: 3, name: 'Door Frame Repair' },
                                    { id: 4, name: 'Wood Panel Installation' }
                                ]}>
                            </ServiceCard>

                            <ServiceCard
                                icon='🎨'
                                header={'Painter'}
                                description={'Applies paint to interior/exterior surfaces and performs surface preparation'}
                                services={[
                                    { id: 1, name: 'Interior Painting' },
                                    { id: 2, name: 'Exterior Painting' },
                                    { id: 3, name: 'Wall Priming' },
                                    { id: 4, name: 'Touch-up & Finishing' }
                                ]}>
                            </ServiceCard>

                            <ServiceCard
                                icon='🔌'
                                header={'Appliance Repair'}
                                description={'Fixes and maintains household appliances like refrigerators, ovens, and washing machines'}
                                services={[
                                    { id: 1, name: 'Refrigerator Repair' },
                                    { id: 2, name: 'Washing Machine Fix' },
                                    { id: 3, name: 'Microwave Servicing' },
                                    { id: 4, name: 'Dishwasher Repair' }
                                ]}>
                            </ServiceCard>

                            <ServiceCard
                                icon='🔐'
                                header={'Locksmith'}
                                description={'Handles lock installation, key duplication, lockouts, and security upgrades'}
                                services={[
                                    { id: 1, name: 'Lock Replacement' },
                                    { id: 2, name: 'Key Duplication' },
                                    { id: 3, name: 'Emergency Unlocking' },
                                    { id: 4, name: 'Smart Lock Installation' }
                                ]}>
                            </ServiceCard>

                            <ServiceCard
                                icon='🐜'
                                header={'Pest Control'}
                                description={'Identifies and removes pests like rodents, insects, and termites from properties'}
                                services={[
                                    { id: 1, name: 'Termite Treatment' },
                                    { id: 2, name: 'Cockroach Removal' },
                                    { id: 3, name: 'Rodent Control' },
                                    { id: 4, name: 'Bed Bug Elimination' }
                                ]}>
                            </ServiceCard>

                            <ServiceCard
                                icon='🏠'
                                header={'Roofing Specialist'}
                                description={'Inspects, repairs, and replaces roofing structures and materials'}
                                services={[
                                    { id: 1, name: 'Leak Repair' },
                                    { id: 2, name: 'Shingle Replacement' },
                                    { id: 3, name: 'Roof Inspection' },
                                    { id: 4, name: 'Gutter Installation' }
                                ]}>
                            </ServiceCard>

                            <ServiceCard
                                icon='🧱'
                                header={'Flooring Specialist'}
                                description={'Installs, repairs, and maintains flooring of all types including tile, wood, and laminate'}
                                services={[
                                    { id: 1, name: 'Tile Installation' },
                                    { id: 2, name: 'Laminate Flooring' },
                                    { id: 3, name: 'Floor Repair' },
                                    { id: 4, name: 'Grouting & Polishing' }
                                ]}>
                            </ServiceCard>

                            <ServiceCard
                                icon='🚪'
                                header={'Door Installer'}
                                description={'Installs and replaces doors and windows for security, aesthetics, and insulation'}
                                services={[
                                    { id: 1, name: 'Door Installation' },
                                    { id: 2, name: 'Window Replacement' },
                                    { id: 3, name: 'Sliding Door Repair' },
                                    { id: 4, name: 'Weather Sealing' }
                                ]}>
                            </ServiceCard>


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
            color: #333;`

export default ClientPage