
import React from "react"
import { Link } from "react-router-dom"
import styled from 'styled-components'
import StyledLinkFunc from "./syledLink"

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
            <StyledLinkFunc dynamicId={`bookservice/${header}`} text={'Book Now'}></StyledLinkFunc>
        </ServiceCardWrapper>

    )
}

export default ServiceCard
{/*
import React from "react";

const ServiceCard = ({ icon, header, description, services }) => {
  const ListItems = services.map((service) => (
    <li key={service.id} className="relative pl-6 text-gray-700 py-1">
      {service.name}
    </li>
  ));

  return (
    <div className="bg-white rounded-2xl p-8 shadow-md transition-all duration-300 cursor-pointer border-2 border-transparent hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-400">
      <div className="w-15 h-15 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{header}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      <ul className="space-y-2">
        {services.map((service) => (
          <li
            key={service.id}
            className="relative pl-6 text-gray-700  before:content-['✓'] before:absolute before:left-0 before:text-green-500 before:font-bold"
          >
            {service.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceCard;
*/}


