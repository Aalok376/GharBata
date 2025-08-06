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
    const [expandedService, setExpandedService] = useState(null)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const navigate = useNavigate()

    const Components = [
        { id: `/client/dashboard`, icon: '📊', text: 'Dashboard' },
        { id: `/client/orders/${clientId}`, icon: '📋', text: 'My Orders' },
        { id: `/client/earnings/${clientId}`, icon: '💰', text: 'Payment' },
        { id: `/dashboard/chats/${userId}`, icon: '📱', text: 'Messages' },
        { id: '/logout', icon: '⚙️', text: 'Logout' },
    ]

    const serviceImages = [
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop'
    ]

    const services = [
        {
            id: 'plumber',
            icon: '🚰',
            header: 'Plumber',
            image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
            description: 'Installation, repair, and maintenance of water pipes, faucets, drains, and sewage systems',
            services: [
                { id: 1, name: 'Leak Repairs' },
                { id: 2, name: 'Pipe Installation' },
                { id: 3, name: 'Clog Removal' },
                { id: 4, name: 'Water Heater Setup' }
            ]
        },
        {
            id: 'electrician',
            icon: '💡',
            header: 'Electrician',
            image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
            description: 'Handles electrical systems, wiring, outlets, lighting, and appliance connections',
            services: [
                { id: 1, name: 'Wiring & Rewiring' },
                { id: 2, name: 'Light Fixture Installation' },
                { id: 3, name: 'Circuit Breaker Repair' },
                { id: 4, name: 'Fan Installation' }
            ]
        },
        {
            id: 'hvac',
            icon: '❄️',
            header: 'HVAC Technician',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
            description: 'Installs and services heating, ventilation, and air conditioning systems',
            services: [
                { id: 1, name: 'AC Maintenance' },
                { id: 2, name: 'Furnace Repair' },
                { id: 3, name: 'Air Filter Replacement' },
                { id: 4, name: 'Thermostat Setup' }
            ]
        },
        {
            id: 'handyman',
            icon: '🧰',
            header: 'Handyman',
            image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
            description: 'Versatile professional for general home repairs and maintenance tasks',
            services: [
                { id: 1, name: 'Wall Fixes' },
                { id: 2, name: 'Minor Plumbing Work' },
                { id: 3, name: 'Shelving & Fixtures' },
                { id: 4, name: 'Gutter Cleaning' }
            ]
        },
        {
            id: 'cleaner',
            icon: '🧽',
            header: 'Cleaner',
            image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&h=300&fit=crop',
            description: 'Performs deep cleaning, routine maintenance, and sanitization for homes and offices',
            services: [
                { id: 1, name: 'Kitchen Cleaning' },
                { id: 2, name: 'Bathroom Cleaning' },
                { id: 3, name: 'Window Cleaning' },
                { id: 4, name: 'Deep Floor Cleaning' }
            ]
        },
        {
            id: 'gardener',
            icon: '🌿',
            header: 'Gardener',
            image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
            description: 'Maintains lawns, gardens, plants, and landscaping features',
            services: [
                { id: 1, name: 'Lawn Mowing' },
                { id: 2, name: 'Hedge Trimming' },
                { id: 3, name: 'Planting & Watering' },
                { id: 4, name: 'Weed Removal' }
            ]
        },
        {
            id: 'carpenter',
            icon: '🪚',
            header: 'Carpenter',
            image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
            description: 'Works with wood to build, install, and repair furniture, doors, and structures',
            services: [
                { id: 1, name: 'Furniture Repair' },
                { id: 2, name: 'Custom Shelving' },
                { id: 3, name: 'Door Frame Repair' },
                { id: 4, name: 'Wood Panel Installation' }
            ]
        },
        {
            id: 'painter',
            icon: '🎨',
            header: 'Painter',
            image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop',
            description: 'Applies paint to interior/exterior surfaces and performs surface preparation',
            services: [
                { id: 1, name: 'Interior Painting' },
                { id: 2, name: 'Exterior Painting' },
                { id: 3, name: 'Wall Priming' },
                { id: 4, name: 'Touch-up & Finishing' }
            ]
        },
        {
            id: 'appliance',
            icon: '🔌',
            header: 'Appliance Repair',
            image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
            description: 'Fixes and maintains household appliances like refrigerators, ovens, and washing machines',
            services: [
                { id: 1, name: 'Refrigerator Repair' },
                { id: 2, name: 'Washing Machine Fix' },
                { id: 3, name: 'Microwave Servicing' },
                { id: 4, name: 'Dishwasher Repair' }
            ]
        },
        {
            id: 'locksmith',
            icon: '🔐',
            header: 'Locksmith',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
            description: 'Handles lock installation, key duplication, lockouts, and security upgrades',
            services: [
                { id: 1, name: 'Lock Replacement' },
                { id: 2, name: 'Key Duplication' },
                { id: 3, name: 'Emergency Unlocking' },
                { id: 4, name: 'Smart Lock Installation' }
            ]
        },
        {
            id: 'pest',
            icon: '🐜',
            header: 'Pest Control',
            image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
            description: 'Identifies and removes pests like rodents, insects, and termites from properties',
            services: [
                { id: 1, name: 'Termite Treatment' },
                { id: 2, name: 'Cockroach Removal' },
                { id: 3, name: 'Rodent Control' },
                { id: 4, name: 'Bed Bug Elimination' }
            ]
        },
        {
            id: 'roofing',
            icon: '🏠',
            header: 'Roofing Specialist',
            image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
            description: 'Inspects, repairs, and replaces roofing structures and materials',
            services: [
                { id: 1, name: 'Leak Repair' },
                { id: 2, name: 'Shingle Replacement' },
                { id: 3, name: 'Roof Inspection' },
                { id: 4, name: 'Gutter Installation' }
            ]
        },
        {
            id: 'flooring',
            icon: '🧱',
            header: 'Flooring Specialist',
            image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop',
            description: 'Installs, repairs, and maintains flooring of all types including tile, wood, and laminate',
            services: [
                { id: 1, name: 'Tile Installation' },
                { id: 2, name: 'Laminate Flooring' },
                { id: 3, name: 'Floor Repair' },
                { id: 4, name: 'Grouting & Polishing' }
            ]
        },
        {
            id: 'door',
            icon: '🚪',
            header: 'Door Installer',
            image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
            description: 'Installs and replaces doors and windows for security, aesthetics, and insulation',
            services: [
                { id: 1, name: 'Door Installation' },
                { id: 2, name: 'Window Replacement' },
                { id: 3, name: 'Sliding Door Repair' },
                { id: 4, name: 'Weather Sealing' }
            ]
        }
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

    // Carousel auto-rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => 
                (prevIndex + 1) % serviceImages.length
            )
        }, 4000)

        return () => clearInterval(interval)
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
                navigate('/', { replace: true })
                window.location.reload()
            } else {
                alert('Logout failed: ' + data.msg)
            }
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const handleViewMore = (serviceId) => {
        setExpandedService(expandedService === serviceId ? null : serviceId)
    }

    return (
        <>
            <style>
                {`
                .dashboard {
                    display: flex;
                    margin-top: 70px;
                    min-height: calc(100vh - 70px);
                }

                .main-content {
                    margin-left: 280px;
                    flex: 1;
                    overflow-y: auto;
                    transition: all 0.3s ease;
                }

                .main-content.expanded {
                    margin-left: 0;
                }

                /* Hero Carousel Section */
                .hero-carousel {
                    position: relative;
                    height: 280px;
                    overflow: hidden;
                    margin: 2rem;
                    border-radius: 15px;
                    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.25);
                }

                .carousel-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                .carousel-slide {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    transition: opacity 1s ease-in-out;
                    background-size: cover;
                    background-position: center;
                }

                .carousel-slide.active {
                    opacity: 1;
                }

                .carousel-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(45deg, rgba(30, 60, 114, 0.7), rgba(102, 126, 234, 0.5));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .carousel-content {
                    text-align: center;
                    max-width: 600px;
                    padding: 0 2rem;
                }

                .carousel-content h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
                }

                .carousel-content p {
                    font-size: 1.3rem;
                    margin-bottom: 2rem;
                    opacity: 0.9;
                }

                .carousel-indicators {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 10px;
                }

                .indicator {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .indicator.active {
                    background: white;
                    transform: scale(1.2);
                }

                /* Welcome Section */
                .welcome-section {
                    padding: 2rem;
                    margin-bottom: 2rem;
                }

                .welcome {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    padding: 2rem;
                    border-radius: 25px;
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }

                .welcome h2 {
                    font-size: 2.5rem;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, #1e3c72 0%, #667eea 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .welcome p {
                    color: #666;
                    font-size: 1.2rem;
                }

                /* Services Section */
                .services-section {
                    padding: 0 2rem 2rem;
                }

                .services-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .services-header h3 {
                    font-size: 2.2rem;
                    color: white;
                    margin-bottom: 1rem;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
                }

                .services-header p {
                    font-size: 1.1rem;
                    color: rgba(255, 255, 255, 0.9);
                    max-width: 600px;
                    margin: 0 auto;
                }

                .services-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                    margin-bottom: 3rem;
                }

                .service-image-card {
                    position: relative;
                    height: 280px;
                    border-radius: 20px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.4s ease;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                }

                .service-image-card:hover {
                    transform: translateY(-10px) scale(1.02);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                }

                .service-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.4s ease;
                }

                .service-image-card:hover .service-image {
                    transform: scale(1.1);
                }

                .service-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
                    color: white;
                    padding: 2rem 1.5rem 1.5rem;
                    transform: translateY(20px);
                    transition: all 0.4s ease;
                }

                .service-image-card:hover .service-overlay {
                    transform: translateY(0);
                }

                .service-title {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }

                .service-icon {
                    font-size: 2rem;
                }

                .service-brief {
                    font-size: 0.9rem;
                    opacity: 0.9;
                    margin-bottom: 1rem;
                    line-height: 1.4;
                }

                .view-more-btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 0.7rem 1.5rem;
                    border-radius: 25px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.9rem;
                }

                .view-more-btn:hover {
                    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
                }

                /* Expanded Service Card */
                .expanded-service {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(10px);
                }

                .expanded-card {
                    background: white;
                    border-radius: 25px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 85vh;
                    overflow: hidden;
                    position: relative;
                    animation: slideIn 0.4s ease;
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
                }

                @keyframes slideIn {
                    from {
                        transform: translateY(-50px) scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }

                .expanded-card-header {
                    position: relative;
                    height: 200px;
                    overflow: hidden;
                }

                .expanded-card-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .expanded-card-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(30, 60, 114, 0.8), rgba(102, 126, 234, 0.6));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .expanded-card-title {
                    text-align: center;
                    padding: 1rem;
                }

                .expanded-card-icon {
                    font-size: 3rem;
                    margin-bottom: 0.5rem;
                    filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
                }

                .expanded-card-name {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
                }

                .expanded-card-subtitle {
                    font-size: 1rem;
                    opacity: 0.9;
                    font-weight: 300;
                }

                .expanded-card-content {
                    padding: 2rem;
                    max-height: calc(85vh - 200px);
                    overflow-y: auto;
                }

                .expanded-description {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: #555;
                    margin-bottom: 2rem;
                    text-align: center;
                }

                .expanded-services-title {
                    font-size: 1.3rem;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 1.5rem;
                    text-align: center;
                    position: relative;
                }

                .expanded-services-title::after {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 60px;
                    height: 3px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 2px;
                }

                .expanded-services-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                }

                .expanded-service-item {
                    background: linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%);
                    padding: 1.2rem;
                    border-radius: 15px;
                    border-left: 4px solid #667eea;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .expanded-service-item:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
                    border-left-color: #764ba2;
                }

                .expanded-service-name {
                    font-weight: 600;
                    color: #333;
                    font-size: 1rem;
                }

                .close-btn {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    font-size: 1.4rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    z-index: 1001;
                    color: #333;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }

                .close-btn:hover {
                    background: rgba(255, 255, 255, 1);
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                }

                @media (max-width: 768px) {
                    .dashboard {
                        grid-template-columns: 1fr;
                    }
                    
                    .main-content {
                        margin-left: 0;
                    }

                    .hero-carousel {
                        height: 250px;
                        margin: 1rem;
                    }

                    .carousel-content h1 {
                        font-size: 2rem;
                    }

                    .services-grid {
                        grid-template-columns: 1fr;
                    }

                    .expanded-card {
                        margin: 1rem;
                        width: calc(100% - 2rem);
                        max-width: calc(100% - 2rem);
                        max-height: 90vh;
                    }

                    .expanded-card-header {
                        height: 160px;
                    }

                    .expanded-card-icon {
                        font-size: 2.5rem;
                    }

                    .expanded-card-name {
                        font-size: 1.5rem;
                    }

                    .expanded-card-content {
                        padding: 1.5rem;
                        max-height: calc(90vh - 160px);
                    }

                    .expanded-services-grid {
                        grid-template-columns: 1fr;
                    }
                }
                `}
            </style>
            <CBody>
                <ClientNavbar 
                    isOpen={isSideBarOpenC} 
                    setIsOpen={setIsSideBarOpenC} 
                    fname={fname} 
                    lname={lname} 
                    profilePic={profilePic} 
                    userType={'client'} 
                    userId={userId}
                />
                <SideBarOverlay isSideBarOpen={isSideBarOpenC} setIsSideBarOpen={setIsSideBarOpenC} />
                
                <div className="dashboard">
                    <SideBar components={Components} isOpen={isSideBarOpenC} onLogout={handleLogout} />
                    
                    <main className="main-content">
                        {/* Hero Carousel */}
                        <div className="hero-carousel">
                            <div className="carousel-container">
                                {serviceImages.map((image, index) => (
                                    <div 
                                        key={index}
                                        className={`carousel-slide ${index === currentImageIndex ? 'active' : ''}`}
                                        style={{ backgroundImage: `url(${image})` }}
                                    />
                                ))}
                                <div className="carousel-overlay">
                                    <div className="carousel-content">
                                        <h1>Your Home, Our Expertise</h1>
                                        <p>Professional services for every corner of your home. Quality work, trusted professionals, seamless experience.</p>
                                    </div>
                                </div>
                                <div className="carousel-indicators">
                                    {serviceImages.map((_, index) => (
                                        <div 
                                            key={index}
                                            className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                                            onClick={() => setCurrentImageIndex(index)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Services Section */}
                        <div className="services-section">
                            <div className="services-header">
                                <h3>Our Services</h3>
                                <p>From plumbing to painting, we've got all your home service needs covered</p>
                            </div>

                            <div className="services-grid">
                                {services.map((service) => (
                                    <div key={service.id} className="service-image-card">
                                        <img 
                                            src={service.image} 
                                            alt={service.header}
                                            className="service-image"
                                        />
                                        <div className="service-overlay">
                                            <div className="service-title">
                                                <span className="service-icon">{service.icon}</span>
                                                {service.header}
                                            </div>
                                            <div className="service-brief">
                                                Professional {service.header.toLowerCase()} services for your home
                                            </div>
                                            <button 
                                                className="view-more-btn"
                                                onClick={() => handleViewMore(service.id)}
                                            >
                                                View More
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>

                {/* Expanded Service Modal */}
                {expandedService && (
                    <div className="expanded-service" onClick={() => setExpandedService(null)}>
                        <div className="expanded-card" onClick={(e) => e.stopPropagation()}>
                            <button 
                                className="close-btn"
                                onClick={() => setExpandedService(null)}
                            >
                                ×
                            </button>
                            {(() => {
                                const service = services.find(s => s.id === expandedService)
                                return service ? (
                                    <>
                                        <div className="expanded-card-header">
                                            <img 
                                                src={service.image} 
                                                alt={service.header}
                                                className="expanded-card-image"
                                            />
                                            <div className="expanded-card-overlay">
                                                <div className="expanded-card-title">
                                                    <div className="expanded-card-icon">{service.icon}</div>
                                                    <div className="expanded-card-name">{service.header}</div>
                                                    <div className="expanded-card-subtitle">Professional Home Services</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="expanded-card-content">
                                            <ServiceCard
                                                icon={service.icon}
                                                header={service.header}
                                                description={service.description}
                                                services={service.services}
                                            />
                                        </div>
                                    </>
                                ) : null
                            })()}
                        </div>
                    </div>
                )}
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

export default ClientPage