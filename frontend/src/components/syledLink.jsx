
import React from "react"
import { Link } from "react-router-dom"
import styled from 'styled-components'

const StyledLink = styled(Link)`
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

            width: ${({ fullwidth }) => (fullwidth ? '100%' : 'auto')};
            fontSize: ${({ fontSize }) => fontSize || '1rem'};
            padding: ${({ padding }) => padding || '0.5rem 1rem'};
            text-align: ${({ align }) => align || 'center'}

            &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }
`

const StyledLinkFunc = ({ dynamicId, text, ...rest }) => {

    return (
        <StyledLink to={dynamicId} {...rest}>{text}</StyledLink>
    )
}

export default StyledLinkFunc



