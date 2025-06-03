import React from "react";
import styled from "styled-components";

const Stepp = styled.div`
        text-align: center;
        position: relative;

        h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #1a1a1a;
        }

        p {
            color: #6b7280;
        }
`

const StepNumber = styled.div`
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: bold;
            color: white;
            margin: 0 auto 1.5rem;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
`

const Steps = ({ stepsnumber, title, description }) => {
    return (
        <Stepp>
            <StepNumber>{stepsnumber}</StepNumber>
            <h3>{title}</h3>
            <p>{description}</p>
        </Stepp>
    )
}

export default Steps