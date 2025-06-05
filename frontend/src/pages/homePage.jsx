import React, { useState,useEffect } from 'react'
import StyledLinkFunc from '../components/syledLink'
import Navbar from '../components/Navbar'
import styled, { keyframes } from 'styled-components'
import ServiceCard from '../components/serviceCard'
import Steps from '../components/steps'
import { Link, useLocation } from 'react-router-dom'

const BodyComponent = styled.div`
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            overflow-x: hidden;
`
const HomePageFunc = () => {

    const { hash } = useLocation()

    useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash)
            console.log(hash,element)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }, [hash])

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
            <Navbar></Navbar>
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

            <Services id="#services">
                <Container>
                    <SectionHeader>
                        <h2>Our Services</h2>
                        <p>Professional home services delivered by verified experts in your area</p>
                    </SectionHeader>
                    <ServicesGrid>
                        <ServiceCard icon='🧽' header={'Home Cleaning'} description={'Deep cleaning, regular maintenance, and specialized cleaning services'} services={Service1}></ServiceCard>
                        <ServiceCard icon='🔧' header={'Home Repairs'} description={'Plumbing, electrical, carpentry, and general home repair services'} services={Service2}></ServiceCard>
                        <ServiceCard icon='🌿' header={'Garden & Lawn Care'} description={'Landscaping, lawn maintenance, and garden care services'} services={Service3}></ServiceCard>
                        <ServiceCard icon='📱' header={'Tech Installation'} description={'Smart home setup, TV mounting, and tech support services'} services={Service4}></ServiceCard>
                        <ServiceCard icon='🏠' header={'Home Maintenance'} description={'Regular upkeep, inspections, and preventive maintenance'} services={Service5}></ServiceCard>
                        <ServiceCard icon='📦' header={'Moving & Assembly'} description={'Furniture assembly, moving assistance, and organization'} services={Service6}></ServiceCard>
                    </ServicesGrid>
                </Container>
            </Services>

            <HowItWorks id="#how-it-works">
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

            <BookingForm>
                <Container>
                    <StyledLinkFunc
                        dynamicId="#book"
                        text="Book Service Now"
                        fullwidth='true'
                        fontSize="1.1rem"
                        padding="1rem"
                        align="center"
                    />
                </Container>
            </BookingForm>

            <FooterComponent>
                <Container>
                    <FooterContainer>
                        <FooterSection>
                            <h3>HomeServe</h3>
                            <p>Your trusted partner for all home service needs. Professional, reliable, and convenient.</p>
                        </FooterSection>
                        <FooterSection>
                            <h3>Services</h3>
                            <ul>
                                <li><Link to="#">Home Cleaning</Link></li>
                                <li><Link to="#">Home Repairs</Link></li>
                                <li><Link to="#">Garden Care</Link></li>
                                <li><Link to="#">Tech Installation</Link></li>
                            </ul>
                        </FooterSection>
                        <FooterSection>
                            <h3>Company</h3>
                            <ul>
                                <li><Link to="#">About Us</Link></li>
                            </ul>
                        </FooterSection>
                        <FooterSection>
                            <h3>Support</h3>
                            <ul>
                                <li><Link to="#">Help Center</Link></li>
                                <li><Link to="#">Contact Us</Link></li>
                                <li><Link to="#">Terms of Service</Link></li>
                                <li><Link to="#">Privacy Policy</Link></li>
                            </ul>
                        </FooterSection>
                    </FooterContainer>
                </Container>
            </FooterComponent>
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
         
            animation: ${TransformStl} 3s ease-in-out infinite
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
                }

            p {
                font-size: 1.25rem;
                opacity: 0.9;
                margin-bottom: 2rem;
                animation: slideInLeft 1s ease-out 0.2s both;
               }
`

const Container = styled.div`
                 max-width: 1200px;
                 margin: 0 auto;
                 padding: 0 20px;`

const HeroCta = styled.div`
                 display: flex;
                 gap: 1rem;
                 animation: slideInLeft 1s ease-out 0.4s both;`

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
`

const Services = styled.div` 
                 padding: 80px 0;
                 background: #f8faff;`

const SectionHeader = styled.div` 
                 text-align: center;
                 margin-bottom: 4rem;
                 
                 h2 {
                 font-size: 2.5rem;
                 font-weight: 700;
                 margin-bottom: 1rem;
                 color: #1a1a1a;
        }      
                 
                 p {
                 font-size: 1.1rem;
                 color: #6b7280;
                 max-width: 600px;
                 margin: 0 auto;
                 `

const ServicesGrid = styled.div` 
                 display: grid;
                 grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                 gap: 2rem;
                 
                 @media (max-width: 768px) {
                    grid-template-columns: 1fr;
                  }
                 `


const HowItWorks = styled.div`
                 padding: 80px 0;
                 background: white;`

const Stepps = styled.div`
                 display: grid;
                 grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                 gap: 3rem;
                 margin-top: 3rem;

                 @media (max-width: 768px) {
                    grid-template-columns: 1fr;
                  }                 
`
const BookingForm = styled.div`
                 background: linear-gradient(135deg, #f8faff 0%, #e8f2ff 100%);
                 padding: 80px 0;
`

const FooterComponent = styled.div`
                 background: #1a1a1a;
                 color: white;
                 padding: 60px 0 30px;`

const FooterContainer = styled.div`
                 display: grid;
                 grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                 gap: 3rem;
                 margin-bottom: 2rem;`

const FooterSection = styled.div`
                 h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    }

                 ul {
                     list-style: none;
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
`

const FooterBottom = styled.div`
                         border-top: 1px solid #374151;
                         padding-top: 2rem;
                         text-align: center;
                         color: #9ca3af;
            `

export default HomePageFunc