import React, { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ServiceCard from '../components/serviceCard'
import Steps from '../components/steps'
import StyledLinkFunc from '../components/syledLink'
import Navbar from '../components/Navbar'
import WhyChoose from '../components/WhyChoose'
import TermsAndCondition from '../components/TermsAndConditon'

const BodyComponent = styled.div`
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            overflow-x: hidden;
`

const HomePageFunc = () => {
    const { hash } = useLocation()
    const navigate = useNavigate()
    const [activeModal, setActiveModal] = useState(null) // 'contact', 'terms', 'privacy', or null
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (hash) {
            const element = document.querySelector(hash)
            console.log(hash, element)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }, [hash])

    const handleBookService = () => {
        navigate('/gharbata/login')
    }

    const handleContactClick = (e) => {
        e.preventDefault()
        setActiveModal('contact')
    }

    const handleTermsClick = (e) => {
        e.preventDefault()
        setActiveModal('terms')
    }

    const handlePrivacyClick = (e) => {
        e.preventDefault()
        setActiveModal('privacy')
    }

    const closeModal = () => {
        setActiveModal(null)
        // Reset form when closing
        setFormData({
            name: '',
            email: '',
            message: ''
        })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleContactSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Replace with your actual API endpoint
            const response = await fetch('https://gharbata.onrender.com/api/auth/contact', {
                method: 'POST',
                credentials:'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                alert('Message sent successfully! We will get back to you soon.')
                closeModal()
            } else {
                throw new Error('Failed to send message')
            }
        } catch (error) {
            console.error('Error sending message:', error)
            alert('Failed to send message. Please try again later.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const Service1 = [
        {
            id: 1,
            name: 'Deep cleaning services',
        },
        {
            id: 2,
            name: 'Regular weekly/monthly cleaning',
        },
        {
            id: 3,
            name: 'Move-in/move-out cleaning',
        },
        {
            id: 4,
            name: 'Eco-friendly products',
        },
    ]

    const Service2 = [
        {
            id: 1,
            name: 'Plumbing & electrical',
        },
        {
            id: 2,
            name: 'Furniture assembly',
        },
        {
            id: 3,
            name: 'Painting & touch-ups',
        },
        {
            id: 4,
            name: 'Emergency repairs',
        },
    ]

    const Service3 = [
        {
            id: 1,
            name: 'Lawn mowing & trimming',
        },
        {
            id: 2,
            name: 'Garden maintenance',
        },
        {
            id: 3,
            name: 'Tree & shrub care',
        },
        {
            id: 4,
            name: 'Seasonal cleanup',
        },
    ]

    const Service4 = [
        {
            id: 1,
            name: 'TV mounting & setup',
        },
        {
            id: 2,
            name: 'Smart home installation',
        },
        {
            id: 3,
            name: 'Wi-Fi optimization',
        },
        {
            id: 4,
            name: 'Device troubleshooting',
        },
    ]

    const Service5 = [
        {
            id: 1,
            name: 'HVAC maintenance',
        },
        {
            id: 2,
            name: 'Gutter cleaning',
        },
        {
            id: 3,
            name: 'Pressure washing',
        },
        {
            id: 4,
            name: 'Safety inspections',
        },
    ]

    const Service6 = [
        {
            id: 1,
            name: 'Furniture assembly',
        },
        {
            id: 2,
            name: 'Packing & unpacking',
        },
        {
            id: 3,
            name: 'Home organization',
        },
        {
            id: 4,
            name: 'Heavy item moving',
        },
    ]

    return (
        <BodyComponent>
            <Navbar />
            <Hero>
                <Container>
                    <HeroContent>
                        <HeroText>
                            <h1>Professional Home Services at Your Doorstep</h1>
                            <p>From cleaning and repairs to maintenance and installations - get trusted professionals to handle all your home needs with just a few clicks.</p>
                            <HeroCta>
                                <StyledLinkFunc dynamicId={'#services'} text={'View Services'}></StyledLinkFunc>
                            </HeroCta>
                        </HeroText>
                        <HeroVisual>
                            <HeroCard>
                                <h3>🏠 Book Your Service</h3>
                                <p>• Same-day availability</p>
                                <p>• Verified professionals</p>
                                <p>• 100% satisfaction guarantee</p>
                                <p>• Transparent pricing</p>
                            </HeroCard>
                        </HeroVisual>
                    </HeroContent>
                </Container>
            </Hero>

            <Services id="services">
                <Container>
                    <SectionHeader>
                        <h2>Our Services</h2>
                        <p>Professional home services delivered by verified experts in your area</p>
                    </SectionHeader>
                    <ServicesGrid>
                        <ServiceCard icon='🧽' header={'Home Cleaning'} description={'Deep cleaning, regular maintenance, and specialized cleaning services'} services={Service1} btnreqd={true}></ServiceCard>
                        <ServiceCard icon='🔧' header={'Home Repairs'} description={'Plumbing, electrical, carpentry, and general home repair services'} services={Service2} btnreqd={true}></ServiceCard>
                        <ServiceCard icon='🌿' header={'Garden & Lawn Care'} description={'Landscaping, lawn maintenance, and garden care services'} services={Service3} btnreqd={true}></ServiceCard>
                        <ServiceCard icon='📱' header={'Tech Installation'} description={'Smart home setup, TV mounting, and tech support services'} services={Service4} btnreqd={true}></ServiceCard>
                        <ServiceCard icon='🏠' header={'Home Maintenance'} description={'Regular upkeep, inspections, and preventive maintenance'} services={Service5} btnreqd={true}></ServiceCard>
                        <ServiceCard icon='📦' header={'Moving & Assembly'} description={'Furniture assembly, moving assistance, and organization'} services={Service6} btnreqd={true}></ServiceCard>
                    </ServicesGrid>
                </Container>
            </Services>

            <div className="py-15 bg-white">
                <WhyChoose />
            </div>

            <AboutSection id="about">
                <Container>
                    <SectionHeader>
                        <h2>About GharBata</h2>
                        <p>Your trusted partner for comprehensive home services in Nepal</p>
                    </SectionHeader>
                    <AboutContent>
                        <AboutGrid>
                            <AboutCard>
                                <AboutIcon>🎯</AboutIcon>
                                <h3>Our Mission</h3>
                                <p>To make home services accessible, reliable, and convenient for every household in Nepal. We bridge the gap between homeowners and skilled professionals.</p>
                            </AboutCard>
                            <AboutCard>
                                <AboutIcon>⭐</AboutIcon>
                                <h3>Quality Assurance</h3>
                                <p>All our service providers are thoroughly vetted, background-checked, and trained to deliver exceptional service with complete transparency.</p>
                            </AboutCard>
                            <AboutCard>
                                <AboutIcon>📱</AboutIcon>
                                <h3>Technology Driven</h3>
                                <p>We leverage modern technology to provide seamless booking, real-time tracking, and secure payment options for your convenience.</p>
                            </AboutCard>
                            <AboutCard>
                                <AboutIcon>🤝</AboutIcon>
                                <h3>Community Focus</h3>
                                <p>Supporting local skilled professionals while providing homeowners with reliable, affordable, and professional home services across Nepal.</p>
                            </AboutCard>
                        </AboutGrid>
                    </AboutContent>
                </Container>
            </AboutSection>

            <HowItWorks id="how-it-works">
                <Container>
                    <SectionHeader>
                        <h2>How It Works</h2>
                        <p>Get your home services booked and completed in just a few simple steps</p>
                    </SectionHeader>
                    <Stepps>
                        <Steps stepsnumber={'1'} title={'Choose Your Service'} description={'Select from our wide range of professional home services and specify your requirements'}></Steps>
                        <Steps stepsnumber={'2'} title={'Schedule & Book'} description={'Pick your preferred date and time, and book your service with verified professionals'}></Steps>
                        <Steps stepsnumber={'3'} title={'Professional Arrives'} description={'Our vetted professional arrives on time with all necessary tools and equipment'}></Steps>
                        <Steps stepsnumber={'4'} title={'Service Completed'} description={'Enjoy your completed service with our satisfaction guarantee and easy payment'}></Steps>
                    </Stepps>
                </Container>
            </HowItWorks>

            <BookingForm id="book">
                <Container>
                    <BookingContent>
                        <h2>Ready to Get Started?</h2>
                        <p>Book your home service today and experience the convenience of professional help at your doorstep.</p>
                        <BookingButton onClick={handleBookService}>
                            Book Service Now
                        </BookingButton>
                    </BookingContent>
                </Container>
            </BookingForm>

            <FooterComponent>
                <Container>
                    <FooterContainer>
                        <FooterSection>
                            <h3>GharBata</h3>
                            <p>Your trusted partner for all home service needs. Professional, reliable, and convenient services delivered right to your doorstep in Nepal.</p>
                        </FooterSection>
                        <FooterSection>
                            <h3>Services</h3>
                            <ul>
                                <li><Link to="#services">Home Cleaning</Link></li>
                                <li><Link to="#services">Home Repairs</Link></li>
                                <li><Link to="#services">Garden Care</Link></li>
                                <li><Link to="#services">Tech Installation</Link></li>
                                <li><Link to="#services">Home Maintenance</Link></li>
                                <li><Link to="#services">Moving & Assembly</Link></li>
                            </ul>
                        </FooterSection>
                        <FooterSection>
                            <h3>Company</h3>
                            <ul>
                                <li><Link to="#about">About Us</Link></li>
                                <li><Link to="#how-it-works">How It Works</Link></li>
                            </ul>
                        </FooterSection>
                        <FooterSection>
                            <h3>Support</h3>
                            <ul>
                                <li><a href="#" onClick={handleTermsClick}>Terms of Service</a></li>
                                <li><a href="#" onClick={handlePrivacyClick}>Privacy Policy</a></li>
                                <li><a href="#" onClick={handleContactClick}>Contact Us</a></li>
                            </ul>
                        </FooterSection>
                    </FooterContainer>
                    <FooterBottom>
                        <p>&copy; 2025 GharBata. All rights reserved.</p>
                    </FooterBottom>
                </Container>
            </FooterComponent>

            {/* Contact Modal */}
            {activeModal === 'contact' && (
                <ContactOverlay onClick={closeModal}>
                    <ContactModal onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <h3>Contact Us</h3>
                            <CloseButton onClick={closeModal}>×</CloseButton>
                        </ModalHeader>
                        <ModalContent>
                            <ContactForm onSubmit={handleContactSubmit}>
                                <InputGroup>
                                    <label>Your Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your name"
                                        required
                                    />
                                </InputGroup>
                                <InputGroup>
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </InputGroup>
                                <InputGroup>
                                    <label>Message</label>
                                    <textarea
                                        rows="5"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        placeholder="Enter your message"
                                        required
                                    ></textarea>
                                </InputGroup>
                                <SubmitButton type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </SubmitButton>
                            </ContactForm>
                        </ModalContent>
                    </ContactModal>
                </ContactOverlay>
            )}

            {/* Terms and Conditions Modal */}
            {activeModal === 'terms' && (
                <TermsAndCondition setIsOverlayOpen={closeModal} />
            )}

            {/* Privacy Policy Modal */}
            {activeModal === 'privacy' && (
                <TermsAndCondition setIsOverlayOpen={closeModal} />
            )}
        </BodyComponent>
    )
}

const TransformStl = keyframes` 
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            `

const Hero = styled.div` 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 120px 0 80px;
            position: relative;
            overflow: hidden;
            
            &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            animation: float 20s ease-in-out infinite;
            }
         
            animation: ${TransformStl} 3s ease-in-out infinite;
            
            @media (max-width: 768px) {
                padding: 100px 0 60px;
            }
            `

const HeroContent = styled.div` 
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
            position: relative;
            z-index: 2;
            
            @media (max-width: 768px) {
                grid-template-columns: 1fr;
                text-align: center;
                gap: 2rem;
            }
            `

const HeroText = styled.div`
            h1 {
                 font-size: 3.5rem;
                 font-weight: 800;
                 line-height: 1.1;
                 margin-bottom: 1.5rem;
                 animation: slideInLeft 1s ease-out;

                  @media (max-width: 768px) {
                    font-size: 2.5rem;
                  }
                  
                  @media (max-width: 480px) {
                    font-size: 2rem;
                  }
                }

            p {
                font-size: 1.25rem;
                opacity: 0.9;
                margin-bottom: 2rem;
                animation: slideInLeft 1s ease-out 0.2s both;
                
                @media (max-width: 768px) {
                    font-size: 1.1rem;
                }
               }
`

const Container = styled.div`
                 max-width: 1200px;
                 margin: 0 auto;
                 padding: 0 20px;
                 
                 @media (max-width: 768px) {
                    padding: 0 15px;
                 }`

const HeroCta = styled.div`
                 display: flex;
                 gap: 1rem;
                 animation: slideInLeft 1s ease-out 0.4s both;
                 
                 @media (max-width: 768px) {
                    justify-content: center;
                 }`

const HeroVisual = styled.div`
                 display: flex;
                 justify-content: center;
                 animation: slideInRight 1s ease-out 0.3s both;`

const slideInLeft = keyframes`
                 from { opacity: 0; transform: translateX(-50px); }
                 to { opacity: 1; transform: translateX(0); }
`

const slideInRight = keyframes`
                 from { opacity: 0; transform: translateX(50px); }
                 to { opacity: 1; transform: translateX(0); }
`

const HeroCard = styled.div`
                 background: rgba(255, 255, 255, 0.1);
                 backdrop-filter: blur(20px);
                 border: 1px solid rgba(255, 255, 255, 0.2);
                 border-radius: 20px;
                 padding: 2rem;
                 max-width: 400px;
                 box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);

                 h3 {
                  font-size: 1.2rem;         
                  font-weight: 600;                 
                  color: #fff;               
                  line-height: 1.3;
                 }

                 animation: ${({ direction }) =>
        direction === 'left' ? slideInLeft : slideInRight} 0.8s ease forwards;
        
        @media (max-width: 768px) {
            max-width: 100%;
            padding: 1.5rem;
        }
`

const Services = styled.div` 
                 padding: 80px 0;
                 background: #f8faff;
                 
                 @media (max-width: 768px) {
                    padding: 60px 0;
                 }`

const SectionHeader = styled.div` 
                 text-align: center;
                 margin-bottom: 4rem;
                 
                 h2 {
                 font-size: 2.5rem;
                 font-weight: 700;
                 margin-bottom: 1rem;
                 color: #1a1a1a;
                 
                 @media (max-width: 768px) {
                    font-size: 2rem;
                 }
        }      
                 
                 p {
                 font-size: 1.1rem;
                 color: #6b7280;
                 max-width: 600px;
                 margin: 0 auto;
                 
                 @media (max-width: 768px) {
                    font-size: 1rem;
                 }
                 }
                 `

const ServicesGrid = styled.div` 
                 display: grid;
                 grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                 gap: 2rem;
                 
                 @media (max-width: 768px) {
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                  }
                 `

const AboutSection = styled.div`
                 padding: 80px 0;
                 background: white;
                 
                 @media (max-width: 768px) {
                    padding: 60px 0;
                 }
`

const AboutContent = styled.div`
                 max-width: 1000px;
                 margin: 0 auto;
`

const AboutGrid = styled.div`
                 display: grid;
                 grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                 gap: 2rem;
                 margin-bottom: 4rem;
                 
                 @media (max-width: 768px) {
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                 }
`

const AboutCard = styled.div`
                 text-align: center;
                 padding: 2rem;
                 border-radius: 15px;
                 background: #f8faff;
                 transition: transform 0.3s ease, box-shadow 0.3s ease;
                 
                 &:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                 }
                 
                 h3 {
                    font-size: 1.3rem;
                    font-weight: 600;
                    margin: 1rem 0;
                    color: #1a1a1a;
                 }
                 
                 p {
                    color: #6b7280;
                    line-height: 1.6;
                 }
                 
                 @media (max-width: 768px) {
                    padding: 1.5rem;
                 }
`

const AboutIcon = styled.div`
                 font-size: 3rem;
                 margin-bottom: 1rem;
`

const HowItWorks = styled.div`
                 padding: 80px 0;
                 background: #f8faff;
                 
                 @media (max-width: 768px) {
                    padding: 60px 0;
                 }`

const Stepps = styled.div`
                 display: grid;
                 grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                 gap: 3rem;
                 margin-top: 3rem;

                 @media (max-width: 768px) {
                    grid-template-columns: 1fr;
                    gap: 2rem;
                  }                 
`

const BookingForm = styled.div`
                 background: linear-gradient(135deg, #f8faff 0%, #e8f2ff 100%);
                 padding: 80px 0;
                 
                 @media (max-width: 768px) {
                    padding: 60px 0;
                 }
`

const BookingContent = styled.div`
                 text-align: center;
                 max-width: 600px;
                 margin: 0 auto;
                 
                 h2 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    color: #1a1a1a;
                    
                    @media (max-width: 768px) {
                        font-size: 2rem;
                    }
                 }
                 
                 p {
                    font-size: 1.1rem;
                    color: #6b7280;
                    margin-bottom: 2rem;
                    
                    @media (max-width: 768px) {
                        font-size: 1rem;
                    }
                 }
`

const BookingButton = styled.button`
                 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                 color: white;
                 border: none;
                 padding: 1rem 3rem;
                 border-radius: 50px;
                 font-size: 1.1rem;
                 font-weight: 600;
                 cursor: pointer;
                 transition: all 0.3s ease;
                 box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
                 
                 &:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
                 }
                 
                 @media (max-width: 768px) {
                    padding: 0.8rem 2rem;
                    font-size: 1rem;
                 }
`

const FooterComponent = styled.div`
                 background: #1a1a1a;
                 color: white;
                 padding: 60px 0 30px;
                 
                 @media (max-width: 768px) {
                    padding: 40px 0 20px;
                 }`

const FooterContainer = styled.div`
                 display: grid;
                 grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                 gap: 3rem;
                 margin-bottom: 2rem;
                 
                 @media (max-width: 768px) {
                    grid-template-columns: 1fr;
                    gap: 2rem;
                 }`

const FooterSection = styled.div`
                 h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    }

                 ul {
                     list-style: none;
                     padding: 0;
                    }

                 ul li {
                         margin-bottom: 0.5rem;
                       }

                 ul li a {
                          color: #9ca3af;
                          text-decoration: none;
                          transition: color 0.3s ease;
                         }
                              
                ul li a:hover {
                         color: #667eea;
                         }
                         
                 p {
                    color: #9ca3af;
                    line-height: 1.6;
                    margin-bottom: 1rem;
                 }
`

const FooterBottom = styled.div`
                         border-top: 1px solid #374151;
                         padding-top: 2rem;
                         text-align: center;
                         color: #9ca3af;
                         
                         @media (max-width: 768px) {
                            padding-top: 1rem;
                            font-size: 0.9rem;
                         }
            `

// Contact Modal Styles
const ContactOverlay = styled.div`
                 position: fixed;
                 top: 0;
                 left: 0;
                 right: 0;
                 bottom: 0;
                 background: rgba(0, 0, 0, 0.7);
                 display: flex;
                 align-items: center;
                 justify-content: center;
                 z-index: 1000;
                 padding: 20px;
`

const ContactModal = styled.div`
                 background: white;
                 border-radius: 15px;
                 width: 100%;
                 max-width: 500px;
                 max-height: 90vh;
                 overflow-y: auto;
                 box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
`

const ModalHeader = styled.div`
                 display: flex;
                 justify-content: space-between;
                 align-items: center;
                 padding: 1.5rem 2rem;
                 border-bottom: 1px solid #e5e7eb;
                 
                 h3 {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #1a1a1a;
                 }
`

const CloseButton = styled.button`
                 background: none;
                 border: none;
                 font-size: 1.5rem;
                 cursor: pointer;
                 color: #6b7280;
                 width: 30px;
                 height: 30px;
                 display: flex;
                 align-items: center;
                 justify-content: center;
                 border-radius: 50%;
                 transition: all 0.2s ease;
                 
                 &:hover {
                    background: #f3f4f6;
                    color: #1a1a1a;
                 }
`

const ModalContent = styled.div`
                 padding: 2rem;
`

const ContactForm = styled.form`
                 display: flex;
                 flex-direction: column;
                 gap: 1.5rem;
`

const InputGroup = styled.div`
                 display: flex;
                 flex-direction: column;
                 gap: 0.5rem;
                 
                 label {
                    font-weight: 500;
                    color: #374151;
                    font-size: 0.9rem;
                 }
                 
                 input, textarea {
                    padding: 0.8rem;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: border-color 0.2s ease;
                    font-family: inherit;
                    
                    &:focus {
                        outline: none;
                        border-color: #667eea;
                        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                    }
                    
                    &::placeholder {
                        color: #9ca3af;
                    }
                 }
                 
                 textarea {
                    resize: vertical;
                    min-height: 100px;
                 }
`

const SubmitButton = styled.button`
                 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                 color: white;
                 border: none;
                 padding: 0.8rem 2rem;
                 border-radius: 8px;
                 font-size: 1rem;
                 font-weight: 600;
                 cursor: pointer;
                 transition: all 0.3s ease;
                 
                 &:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                 }
                 
                 &:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    background: #9ca3af;
                 }
`

export default HomePageFunc