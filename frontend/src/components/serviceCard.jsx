import React from "react"
import { Link } from "react-router-dom"
import styled from 'styled-components'

const ServiceCardWrapper = styled.div`
            background: white;
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            cursor: pointer;
            border: 2px solid transparent;

            &:hover{
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            border-color: #667eea;
            }

            h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #1a1a1a;
            }

            p {
            color: #6b7280;
            margin-bottom: 1.5rem;
            }
`

const ServiceIconWrapper = styled.div`

            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
`

const ServiceFeaturesWrapper = styled.ul`
            list-style: none;
            margin-bottom: 1.5rem;

            li {
            padding: 0.5rem 0;
            color: #4a5568;
            position: relative;
            padding-left: 1.5rem;
            }

            li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
            }
`

const ServiceCard = ({ icon, header, description, services }) => {
    const ListItems = services.map(service => (
        <li key={service.id}>{service.name}</li>
    ))

    return (
        <ServiceCardWrapper>
            <ServiceIconWrapper>{icon}</ServiceIconWrapper>
            <h3>{header}</h3>
            <p>{description}</p>
            <ServiceFeaturesWrapper>{ListItems}</ServiceFeaturesWrapper>
        </ServiceCardWrapper>

    )
}

export default ServiceCard
